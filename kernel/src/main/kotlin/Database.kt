package com.kjrandez.context.kernel

import java.io.File
import kotlin.io.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.ContextualSerialization
import com.kjrandez.context.kernel.entity.*

class DatabaseException(message: String) : Exception(message)

@Serializable
data class DatabaseInitializer(@ContextualSerialization val rootPage: DocumentEntity, val nextIndex: Int)

@Serializable
data class EntitySeed(
    val backing: Backing?,
    val backingValue: RpcDataClass?,
    val agentType: AgentType
)

class Transaction(
    val eid: Int,
    val description: String,
    val forward: () -> Unit,
    val backward: () -> Unit
)

class Ledger(private val eid: Int, private val log: suspend (Transaction) -> Unit)
{
    suspend fun transaction(description: String, forward: () -> Unit, backward: () -> Unit) {
        log(Transaction(eid, description, forward, backward))
    }
}

class Database(
    private var rootDirectory: File,
    private val broadcast: suspend (Int) -> Unit
) {
    private val json = rpcJson(this)
    private val elementMap: MutableMap<Int, Entity> = mutableMapOf()
    private var nextIndex: Int

    var rootPage: DocumentEntity private set

    private val past = mutableListOf<Transaction>()
    private val future = mutableListOf<Transaction>()

    init {
        val initializer = loadInitializer()
        if (initializer != null) {
            println("Loaded database initializer from ${rootDirectory.absolutePath}")
            nextIndex = initializer.nextIndex
            rootPage = initializer.rootPage
        } else {
            println("Creating database initializer in ${rootDirectory.absolutePath}")
            rootDirectory.mkdirs()

            nextIndex = 0
            rootPage = Builder(::buildPersistent).makeHelloWorld()
            storeInitializer()
        }
    }

    fun lookup(eid: Int): Entity {
        val entity = elementMap[eid]
        if (entity != null)
            return entity

        val seed = loadEntity(eid)
        return if (seed.backing == null) {
            DocumentEntity(
                { elementMap[eid] = it; eid },
                InternalBacking(seed.backingValue!!),
                seed.agentType,
                Ledger(eid, this::log)
            )
        } else {
            DocumentEntity(
                { elementMap[eid] = it; eid },
                seed.backing,
                seed.agentType,
                Ledger(eid, this::log)
            )
        }
    }

    fun buildPersistent(backing: Backing, agentType: AgentType): DocumentEntity {
        val eid = nextIndex++
        val entity = DocumentEntity(
            { eid },
            backing,
            agentType,
            Ledger(eid, this::log)
        )

        if (backing is InternalBacking<*>) {
            val backingValue = backing.value
            storeEntity(eid, EntitySeed(null, backingValue, entity.agentType))
        } else {
            storeEntity(eid, EntitySeed(backing, null, agentType))
        }

        return entity
    }

    fun registerEphemeral(entity: Entity): Int {
        val eid = nextIndex++
        elementMap[eid] = entity
        return eid
    }

    suspend fun log(trans: Transaction) {
        past.add(trans)
        future.clear()

        trans.forward()
        broadcast(trans.eid)
    }

    suspend fun undo() {
        if (past.size > 0) {
            val trans = past.removeAt(past.size - 1)
            future.add(trans)

            trans.backward()
            broadcast(trans.eid)
        }
    }

    suspend fun redo() {
        if (future.size > 0) {
            val trans = future.removeAt(future.size - 1)
            past.add(trans)

            trans.forward()
            broadcast(trans.eid)
        }
    }

    private fun loadInitializer(): DatabaseInitializer? {
        val descriptor: File = File(rootDirectory, "dbinit.json")
        if (descriptor.exists() && descriptor.isFile()) {
            return json.parse(DatabaseInitializer.serializer(), descriptor.readText())
        } else {
            return null
        }
    }

    private fun storeInitializer() {
        val descriptor: File = File(rootDirectory, "dbinit.json")
        val initializer = DatabaseInitializer(rootPage, nextIndex)
        descriptor.writeText(json.stringify(DatabaseInitializer.serializer(), initializer))
    }

    private fun loadEntity(eid: Int): EntitySeed {
        val descriptor = File(rootDirectory, "${eid}.json")
        return json.parse(EntitySeed.serializer(), descriptor.readText())
    }

    private fun storeEntity(eid: Int, seed: EntitySeed) {
        val descriptor = File(rootDirectory, "${eid}.json")
        descriptor.writeText(json.stringify(EntitySeed.serializer(), seed))
    }
}

class Builder(private val build: (Backing, AgentType) -> DocumentEntity)
{
    fun page(vararg content: DocumentEntity): DocumentEntity {
        return build(
            InternalBacking(PageValue(
                content.mapIndexed { index: Int, entity: DocumentEntity ->
                    PageEntry(index, entity)
                }.toMutableList()
            )),
            AgentType.Page
        )
    }

    fun text (content: String): DocumentEntity {
        return build(InternalBacking(TextValue(content)), AgentType.Text)
    }

    fun makeHelloWorld() = page(
        text("Hello world!"),
        text("How are you today?"),
        page(
            text("I'm doing just fine thank you."),
            text("That's great to hear.")
        )
    )
}
