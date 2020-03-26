package com.kjrandez.context.kernel.entity

import kotlin.reflect.KClass
import kotlin.reflect.full.memberFunctions
import kotlin.reflect.full.primaryConstructor

class EntityAgentContext(
    val backing: EntityBacking,
    val doBecome: (KClass<EntityAgent>) -> Unit,
    val doRelocate: () -> Unit
)

abstract class EntityAgent(private val context: EntityAgentContext)
{
    fun become(type: KClass<EntityAgent>) {
        context.doBecome(type)
    }

    fun type(): String {
        return this::class.simpleName!!
    }
}

abstract class EntityBacking

data class DiskFile(val path: String) : EntityBacking()

class Entity(val eid: Int, val backing: EntityBacking, type: KClass<EntityAgent>) {
    lateinit var agent: EntityAgent

    init {
        become(type)
    }

    fun become(type: KClass<EntityAgent>) {
        agent = type.primaryConstructor!!.call(
            EntityAgentContext(
                backing,
                { become(it) },
                {})
        )
    }

    fun send(selector: String, args: Array<Any?>) {
        for (func in agent::class.memberFunctions) {
            if (func.name == selector) {
                func.call(agent, *args)
            }
        }
    }
}
