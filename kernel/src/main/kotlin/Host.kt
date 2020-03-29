package com.kjrandez.context.kernel

import com.kjrandez.context.kernel.entity.Entity
import io.javalin.websocket.WsContext

class Host(val ctx: WsContext, private val database: Database)
{
    private val hostService = HostService { it: Entity -> database.register(it) }
    private val rpc = Rpc(database, hostService) { it: String -> ctx.send(it); Unit }

    suspend fun receive(message: String) = rpc.receive(message)

    init {
        rpc.clientService.send("hello", listOf(hostService))
    }
}

class HostService(register: (Entity) -> Int) : Entity(register) {
    override suspend fun invoke(selector: String, args: Array<Any?>): Any? {
        return when (selector) {
            "ping" -> "pong"
            else -> this.failed()
        }
    }
}
