package com.kjrandez.context.kernel

import com.kjrandez.context.kernel.entity.*

class DatabaseException(message: String) : Exception(message)

class Database()
{
    val elementMap: MutableMap<Int, Entity> = mutableMapOf()
    var nextIndex = 0

    fun register(entity: Entity): Int {
        elementMap[nextIndex] = entity
        return nextIndex++
    }

    fun lookup(eid: Int): Entity {
        return elementMap[eid] ?: throw DatabaseException("Key is not in database")
    }
}
