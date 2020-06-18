package com.kjrandez.context.kernel

import com.kjrandez.context.kernel.entity.*
import io.javalin.Javalin
import kotlinx.coroutines.*
import java.io.File

class Server
{
    val database = Database(
        File(System.getProperty("user.dir"), "database"),
        this::broadcast
    )

    val hosts = mutableMapOf<String, Host>()

    fun run() {
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

    suspend fun broadcast(eid: Int) {
        for ((_, host) in hosts) {
            host.broadcast(eid)
        }
    }
}

fun main() {
    Server().run()
}
