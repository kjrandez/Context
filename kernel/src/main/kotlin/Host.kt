package com.kjrandez.context.kernel

import com.kjrandez.context.kernel.entity.*
import io.javalin.websocket.WsContext

class Host(val ctx: WsContext, private val database: Database)
{
    private val hostService = HostService(database::registerEphemeral, database.rootPage)
    private val rpc = Rpc(database, hostService) { ctx.send(it); Unit }

    suspend fun receive(message: String) = rpc.receive(message)

    init {
        rpc.clientService.send("hello", listOf(hostService))
    }
}

class HostService(register: (Entity) -> Int, val rootPage: DocumentEntity) : Entity(register)
{
    override suspend fun invoke(selector: String, args: Array<Any?>): Any? {
        return when (selector) {
            "ping" -> "pong"
            "rootPage" -> rootPage
            else -> throw EntityException("Selector not available")
        }
    }
}
