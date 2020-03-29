package com.kjrandez.context.kernel.entity

import kotlin.reflect.KClass
import kotlin.reflect.full.memberFunctions
import kotlin.reflect.full.primaryConstructor

abstract class Entity(register: (Entity) -> Int)
{
    val eid = register(this)

    abstract suspend fun invoke(selector: String, args: Array<Any?>): Any?

    class InvokeException(message: String) : Exception(message)

    fun failed(): Any? {
        throw InvokeException("Bad invocation")
    }
}

class DocumentEntity(register: (Entity) -> Int, val backing: Backing, type: KClass<Agent>) : Entity(register) {
    lateinit var agent: Agent

    init {
        become(type)
    }

    fun become(type: KClass<Agent>) {
        agent = type.primaryConstructor!!.call(
            AgentContext(
                backing,
                { become(it) },
                {}
            )
        )
    }

    override suspend fun invoke(selector: String, args: Array<Any?>): Any? {
        return dynamicDispatch(selector, args)
    }



    private fun dynamicDispatch(selector: String, args: Array<Any?>): Any? {
        for (func in agent::class.memberFunctions) {
            if (func.name == selector) {
                return func.call(agent, *args)
            }
        }
        return failed()
    }
}

abstract class Backing
data class DiskFile(val path: String) : Backing()

class AgentContext(
    val backing: Backing,
    val doBecome: (KClass<Agent>) -> Unit,
    val doRelocate: () -> Unit
)

abstract class Agent(private val context: AgentContext)
{
    fun become(type: KClass<Agent>) {
        context.doBecome(type)
    }

    fun type(): String {
        return this::class.simpleName!!
    }
}
