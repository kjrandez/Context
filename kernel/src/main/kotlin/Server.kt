package com.kjrandez.context.kernel

import io.javalin.Javalin
import io.javalin.websocket.*

class Server
{
    private val database = Database()
    private val app = Javalin.create().start(8085)
    private val hosts = mutableMapOf<String, Host>()

    init {
        app.ws("/broacast") {
            it.onConnect { resolveHost(it) }
            it.onMessage { resolveHost(it).handleMessage(it) }
            it.onClose { removeHost(it) }
        }
    }

    fun resolveHost(ctx: WsContext): Host {
        return hosts[ctx.sessionId] ?: Host(ctx, database).also {
            hosts[ctx.sessionId] = it
        }
    }

    fun removeHost(ctx: WsCloseContext) {
        hosts.remove(ctx.sessionId)
    }
}

fun main() {
    Server()
}
