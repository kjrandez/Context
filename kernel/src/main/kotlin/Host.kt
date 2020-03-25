package com.kjrandez.context.kernel

import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.SerializersModule

interface RpcArgument

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

@Serializable @SerialName("map")
data class RpcMap(val value: Map<String, RpcArgument?>) : RpcArgument

@Serializable @SerialName("hostObj")
data class RpcHostObj(val value: Long) : RpcArgument

@Serializable @SerialName("clientObj")
data class RpcClientObj(val value: Long) : RpcArgument

interface RpcMessage

@Serializable @SerialName("send")
data class RpcSend (
    val target: Long,
    val selector: String,
    val arguments: List<RpcArgument?>
) : RpcMessage

@Serializable @SerialName("call")
data class RpcCall (
    val id: Int,
    val target: Long,
    val selector: String,
    val arguments: List<RpcArgument?>
) : RpcMessage

@Serializable @SerialName("return")
data class RpcYield (
    val id: Int,
    val result: RpcArgument?
) : RpcMessage

class Objeta (
    val id: Long
)

class Proxy (
    val id: Long
)

class RpcEncodeException(message: String) : Exception(message)

fun wrapRpcArgument(arg: Any?): RpcArgument? {
    return when (arg) {
        is List<*> -> RpcList(arg.map { wrapRpcArgument(it) })
        is Map<*, *> -> RpcMap((arg as Map<String, *>).mapValues { wrapRpcArgument (it.value) })
        is Int -> RpcInt(arg)
        is Double -> RpcFloat(arg)
        is String -> RpcString(arg)
        is Boolean -> RpcBool(arg)
        is Objeta -> RpcHostObj(arg.id)
        is Proxy -> RpcClientObj(arg.id)
        null -> null
        else -> throw RpcEncodeException("No encoding for argument type")
    }
}

fun unwrapRpcArgument(arg: RpcArgument?): Any? {
    return when (arg) {
        is RpcList -> arg.value.map { unwrapRpcArgument(it) }
        is RpcMap -> arg.value.mapValues { unwrapRpcArgument(it.value) }
        is RpcInt -> arg.value
        is RpcFloat -> arg.value
        is RpcString -> arg.value
        is RpcBool -> arg.value
        is RpcHostObj -> Objeta(arg.value) // Look up host object
        is RpcClientObj -> Proxy(arg.value) // Create, look up client proxy
        else -> null
    }
}

fun test() {
    val rpcModule = SerializersModule {
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
    }

    val json = Json(context=rpcModule)
    val source = RpcSend(0, "doSomething", listOf<Any?>(5, "haha", Objeta(3)).map {wrapRpcArgument(it)})
    val res = json.stringify(PolymorphicSerializer(RpcMessage::class), source)
    val back = json.parse(PolymorphicSerializer(RpcMessage::class), res)

    println(source)
    println(res)
    println(back)

    fun verify(a: Int, b: String, c: Objeta) {
        println("Verifying: ")
        println(a)
        println(b)
        println(c)
    }

    if (back is RpcSend) {
        val args = back.arguments.map { unwrapRpcArgument(it) }.toTypedArray()
        ::verify.call(*args)
    }

    /*val app = Javalin.create().start(8085)
    app.ws("/broadcast") {
        it.onConnect { ctx -> println("Connected") }
    }*/
}