package com.kjrandez.context.kernel

import io.javalin.websocket.WsContext

class Host(val ctx: WsContext, private val database: Database)
{
    private val rpc = Rpc(database, { ctx.send(it) })

    suspend fun handleMessage(message: String) {
        rpc.handleMessage(message)
    }
}
