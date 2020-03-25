package com.kjrandez.context.kernel

import io.javalin.Javalin
import java.lang.reflect.Type
import kotlinx.serialization.*
import kotlinx.serialization.json.*

class Server
{
    fun run() {

    }
}

fun foo(a: Int, b: (Int) -> Unit) {
    b(a)
}

data class HostElement(val eid: Int)
data class ClientElement(val eid: Int)

data class Argument(val type: String, val value: Any)

fun encode(arg: Any): Argument = when(arg) {
    is Element -> Argument("hostObj", arg.eid)
    else -> Argument("primitive", arg)
}

fun decode(arg: Map<String, Any>): Any? = when(arg["type"] as String) {
    "hostObj" -> Element.elementMap[arg["value"]]
    else -> arg["value"]
}

class Something {
    fun test(a: Long, b: String, c: Boolean?) {
        print("" + a + " " + b + " " + c)
    }
}

@Serializable
data class Wot(
    val test: Array<JsonElement>,
    val extra: Int?
)

fun main() {
    val root = Page(listOf(
        Text("Hello, world"),
        Text("Hello to you too!"),
        Page(listOf(
            Text("Here's some inner content"),
            Text("I made just for you!")
        )),
        Text("The End")
    ))

    test()
}
