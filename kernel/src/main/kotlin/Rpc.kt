package com.kjrandez.context.kernel

import com.kjrandez.context.kernel.entity.*
import kotlinx.serialization.PolymorphicSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlin.coroutines.Continuation
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

interface RpcMessage
interface RpcArgument
interface RpcDataClass

@Serializable @SerialName("int")
data class RpcInt(val value: Int) : RpcArgument

@Serializable @SerialName("float")
data class RpcFloat(val value: Double) : RpcArgument

@Serializable @SerialName("string")
data class RpcString(val value: String) : RpcArgument

@Serializable @SerialName("bool")
data class RpcBool(val value: Boolean) : RpcArgument

@Serializable @SerialName("list")
data class RpcList(val value: List<RpcArgument?>) : RpcArgument

@Serializable @SerialName("dict")
data class RpcDict(val value: Map<String, RpcArgument?>) : RpcArgument

@Serializable @SerialName("hostObj")
data class RpcHostObj(val value: Int) : RpcArgument

@Serializable @SerialName("clientObj")
data class RpcClientObj(val value: Int) : RpcArgument

@Serializable @SerialName("data")
data class RpcData(val value: RpcDataClass) : RpcArgument

@Serializable @SerialName("send")
data class RpcSend (
    val target: Int,
    val selector: String,
    val arguments: List<RpcArgument?>
) : RpcMessage

@Serializable @SerialName("call")
data class RpcCall (
    val id: Int,
    val target: Int,
    val selector: String,
    val arguments: List<RpcArgument?>
) : RpcMessage

@Serializable @SerialName("yield")
data class RpcYield (
    val id: Int,
    val result: RpcArgument?
) : RpcMessage

@Serializable @SerialName("error")
data class RpcError (
    val id : Int?,
    val message: String
) : RpcMessage

class RpcEncodeException(message: String) : Exception(message)

class Proxy (
    val eid: Int,
    val call: suspend (selector: String, args: List<Any?>) -> Any?,
    val send: (selector: String, args: List<Any?>) -> Unit
)

class Rpc(private val database: Database, private val hostService: Entity, private val sendMessage: (String) -> Unit)
{
    private val json = rpcJson(database)

    private val proxyMap = mutableMapOf<Int, Proxy>()
    private val callMap = mutableMapOf<Int, Continuation<Any?>>()
    private var nextCallId = 0

    val clientService = resolveProxy(0)

    suspend fun receive(message: String) {
        val desc = parse(message)
        when (desc) {
            is RpcCall -> dispatchCall(desc)
            is RpcSend -> dispatchSend(desc)
            is RpcYield -> dispatchYield(desc)
            is RpcError -> dispatchError(desc)
            else -> Unit
        }
    }

    private suspend fun dispatchCall(desc: RpcCall) {
        try {
            // Throws DatabaseException, EntityException, or RpcEncodingException
            val entity = resolveEntity(desc.target)
            val result = entity.invoke(desc.selector, desc.arguments.map { unwrapRpcArgument(it) }.toTypedArray())
            val yieldDesc = RpcYield(desc.id, wrapRpcArgument(result))
            sendMessage(stringify(yieldDesc))
        } catch(ex: Exception) {
            ex.printStackTrace()
            sendMessage(stringify(RpcError(desc.id, ex.message ?: "N/A")))
        }
    }

    private suspend fun dispatchSend(desc: RpcSend) {
        val entity = resolveEntity(desc.target)

        try {
            entity.invoke(desc.selector, desc.arguments.map { unwrapRpcArgument(it) }.toTypedArray())
        } catch(ex: Exception) {
            ex.printStackTrace()
            sendMessage(stringify(RpcError(null, ex.message ?: "N/A")))
        }
    }

    private fun dispatchYield(desc: RpcYield) {
        val cont = callMap[desc.id]
        if (cont != null) {
            callMap.remove(desc.id)
            cont.resume(unwrapRpcArgument(desc.result))
        }
    }

    private fun dispatchError(desc: RpcError) {
        if (desc.id != null) {
            val cont = callMap[desc.id]
            if (cont != null) {
                callMap.remove(desc.id)
                cont.resumeWithException(RpcEncodeException("Remote error: ${desc.message}"))
            }
        }
    }

    private suspend fun call(target: Int, selector: String, args: List<Any?>): Any? {
        return suspendCoroutine { cont ->
            val callId = nextCallId
            callMap[callId] = cont

            val callDesc = RpcCall(callId, target, selector, args.map { wrapRpcArgument(it) })
            sendMessage(stringify(callDesc))
        }
    }

    private fun send(target: Int, selector: String, args: List<Any?>) {
        val sendDesc = RpcSend(target, selector, args.map { wrapRpcArgument(it) })
        sendMessage(stringify(sendDesc))
    }

    private fun stringify(message: RpcMessage) = json.stringify(PolymorphicSerializer(RpcMessage::class), message)
    private fun parse(message: String) = json.parse(PolymorphicSerializer(RpcMessage::class), message)

    private fun wrapRpcArgument(arg: Any?): RpcArgument? {
        return when (arg) {
            is List<*> -> RpcList(arg.map { wrapRpcArgument(it) })
            is Map<*, *> -> RpcDict((arg as Map<String, *>).mapValues { wrapRpcArgument (it.value) })
            is Int -> RpcInt(arg)
            is Double -> RpcFloat(arg)
            is String -> RpcString(arg)
            is Boolean -> RpcBool(arg)
            is Entity -> RpcHostObj(arg.eid)
            is Proxy -> RpcClientObj(arg.eid)
            is RpcDataClass -> RpcData(arg)
            null -> null
            else -> throw RpcEncodeException("No encoding for argument type")
        }
    }

    private fun unwrapRpcArgument(arg: RpcArgument?): Any? {
        return when (arg) {
            is RpcList -> arg.value.map { unwrapRpcArgument(it) }
            is RpcDict -> arg.value.mapValues { unwrapRpcArgument(it.value) }
            is RpcInt -> arg.value
            is RpcFloat -> arg.value
            is RpcString -> arg.value
            is RpcBool -> arg.value
            is RpcHostObj -> resolveEntity(arg.value)
            is RpcClientObj -> resolveProxy(arg.value)
            is RpcData -> arg.value
            null -> null
            else -> Unit
        }
    }

    private fun resolveProxy(eid: Int): Proxy {
        return proxyMap[eid] ?: Proxy(
            eid,
            { selector, args -> this.call(eid, selector, args) },
            { selector, args -> this.send(eid, selector, args) }
        ).also { proxyMap[eid] = it }
    }

    private fun resolveEntity(eid: Int): Entity {
        return database.lookup(eid)
    }
}
