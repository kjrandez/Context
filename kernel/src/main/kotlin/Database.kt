package com.kjrandez.context.kernel

import com.kjrandez.context.kernel.entity.*

class DatabaseException(message: String) : Exception(message)

class Database()
{
    val elementMap: MutableMap<Int, Entity> = mutableMapOf()
    var nextIndex = 0

    var rootPage: DocumentEntity

    init {
        val build = Builder(::register)

        rootPage = build.page(
            build.text("Hello world!"),
            build.text("How are you today?"),
            build.page(
                build.text("I'm doing just fine thank you."),
                build.text("That's great to hear.")
            )
        )
    }

    fun register(entity: Entity): Int {
        elementMap[nextIndex] = entity
        return nextIndex++
    }

    fun lookup(eid: Int): Entity {
        return elementMap[eid] ?: throw DatabaseException("Key is not in database")
    }
}

class Builder(private val register: (Entity) -> Int)
{
    fun page(vararg content: DocumentEntity): DocumentEntity {
        return DocumentEntity(
            register,
            InternalBacking(PageValue(
                content.mapIndexed { index: Int, entity: DocumentEntity ->
                    PageEntry(index, entity)
                }.toMutableList()
            )),
            AgentType.Page
        )
    }

    fun text (content: String): DocumentEntity {
        return DocumentEntity(register, InternalBacking(TextValue(content)), AgentType.Text)
    }
}
