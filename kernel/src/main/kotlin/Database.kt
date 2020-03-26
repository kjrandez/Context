package com.kjrandez.context.kernel

import com.kjrandez.context.kernel.entity.*
import kotlin.reflect.KClass

class Database()
{
    var nextIndex = 0;
    val elementMap: MutableMap<Int, Entity> = mutableMapOf()

    fun newEntity(backing: EntityBacking, type: KClass<EntityAgent>) {
        val e = Entity(nextIndex, backing, type)
        elementMap[nextIndex] = e
        nextIndex++
    }
}
