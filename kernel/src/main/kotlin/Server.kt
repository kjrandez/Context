package com.kjrandez.context.kernel

import io.javalin.Javalin
import kotlinx.coroutines.*

fun main() {
    val database = Database()
    val hosts = mutableMapOf<String, Host>()

    Javalin.create().start(8085).ws("/broadcast") {
        it.onConnect { ctx ->
            hosts[ctx.sessionId] = Host(ctx, database)
        }
        it.onMessage { ctx ->
            GlobalScope.launch {
                hosts[ctx.sessionId]?.receive(ctx.message())
            }
        }
        it.onClose { ctx ->
            hosts.remove(ctx.sessionId)
        }
    }
}
