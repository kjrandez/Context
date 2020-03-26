package com.kjrandez.context.kernel

import com.kjrandez.context.kernel.entity.Entity
import kotlinx.serialization.PolymorphicSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.json
import kotlinx.serialization.modules.SerializersModule
import kotlin.coroutines.suspendCoroutine

interface RpcArgument

@Serializable
@SerialName("int")
data class RpcInt(val value: Int) : RpcArgument

@Serializable
@SerialName("float")
data class RpcFloat(val value: Double) : RpcArgument

@Serializable
@SerialName("string")
data class RpcString(val value: String) : RpcArgument

@Serializable
@SerialName("bool")
data class RpcBool(val value: Boolean) : RpcArgument

@Serializable
@SerialName("list")
data class RpcList(val value: List<RpcArgument?>) : RpcArgument

@Serializable
@SerialName("map")
data class RpcMap(val value: Map<String, RpcArgument?>) : RpcArgument

@Serializable
@SerialName("hostObj")
data class RpcHostObj(val value: Int) : RpcArgument

@Serializable
@SerialName("clientObj")
data class RpcClientObj(val value: Int) : RpcArgument

interface RpcMessage

@Serializable
@SerialName("send")
data class RpcSend (
    val target: Int,
    val selector: String,
    val arguments: List<RpcArgument?>
) : RpcMessage

@Serializable
@SerialName("call")
data class RpcCall (
    val id: Int,
    val target: Int,
    val selector: String,
    val arguments: List<RpcArgument?>
) : RpcMessage

@Serializable
@SerialName("return")
data class RpcYield (
    val id: Int,
    val result: RpcArgument?
) : RpcMessage

class RpcEncodeException(message: String) : Exception(message)

fun rpcJson(): Json {
    return Json(context=SerializersModule {
        polymorphic(RpcArgument::class) {
            RpcInt::class with RpcInt.serializer()
            RpcFloat::class with RpcFloat.serializer()
            RpcString::class with RpcString.serializer()
            RpcBool::class with RpcBool.serializer()
            RpcList::class with RpcList.serializer()
            RpcMap::class with RpcMap.serializer()
            RpcHostObj::class with RpcHostObj.serializer()
            RpcClientObj::class with RpcClientObj.serializer()
        }
        polymorphic(RpcMessage::class) {
            RpcCall::class with RpcCall.serializer()
            RpcSend::class with RpcSend.serializer()
            RpcYield::class with RpcYield.serializer()
        }
    })
}

class Proxy (
    val call: (selector: String, args: List<Any?>) -> Any?,
    val send: (selector: String, args: List<Any?>) -> Unit
)

class Rpc(private val database: Database, private val send: (String) -> Unit)
{
    val json = rpcJson()

    val proxyMap = mutableMapOf<Int, Proxy>()
    var nextProxyId = 0

    val callMap = mutableMapOf<Int, Proxy>()
    val nextCallId = 0

    fun receive(message: String) {

    }

    private suspend fun call(target: Int, selector: String, args: List<Any?>): Any? {
        return suspendCoroutine {  }
    }

    private fun send(target: Int, selector: String, args: List<Any?>) {

    }

    private fun stringify(message: RpcMessage) = json.stringify(PolymorphicSerializer(RpcMessage::class), message)
    private fun parse(message: String) = json.parse(PolymorphicSerializer(RpcMessage::class), message)

    private fun wrapRpcArgument(arg: Any?): RpcArgument? {
        return when (arg) {
            is List<*> -> RpcList(arg.map { wrapRpcArgument(it) })
            is Map<*, *> -> RpcMap((arg as Map<String, *>).mapValues { wrapRpcArgument (it.value) })
            is Int -> RpcInt(arg)
            is Double -> RpcFloat(arg)
            is String -> RpcString(arg)
            is Boolean -> RpcBool(arg)
            is Entity -> RpcHostObj(arg.eid)
            is Proxy -> RpcClientObj(arg.id)
            null -> null
            else -> throw RpcEncodeException("No encoding for argument type")
        }
    }

    private fun unwrapRpcArgument(arg: RpcArgument?): Any? {
        return when (arg) {
            is RpcList -> arg.value.map { unwrapRpcArgument(it) }
            is RpcMap -> arg.value.mapValues { unwrapRpcArgument(it.value) }
            is RpcInt -> arg.value
            is RpcFloat -> arg.value
            is RpcString -> arg.value
            is RpcBool -> arg.value
            is RpcHostObj -> resolveEntity(arg.value)
            is RpcClientObj -> resolveProxy(arg.value)
            else -> null
        }
    }

    private fun resolveProxy(eid: Int): Proxy {
        return proxyMap[eid] ?: Proxy(
            { selector, args -> this.call(eid, selector, args) },
            { selector, args -> this.call(eid, selector, args) }
        ).also { proxyMap[eid] = it }
    }

    private fun resolveEntity(eid: Int) {

    }
}



