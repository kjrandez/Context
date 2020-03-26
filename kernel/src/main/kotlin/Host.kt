package com.kjrandez.context.kernel

import io.javalin.websocket.WsContext
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.SerializersModule

class Host(val ctx: WsContext, private val database: Database)
{
    fun handleMessage() {

    }
}

fun test() {

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


}