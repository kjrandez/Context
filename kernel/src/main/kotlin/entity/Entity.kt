package com.kjrandez.context.kernel.entity

import com.kjrandez.context.kernel.Database
import com.kjrandez.context.kernel.RpcDataClass
import kotlinx.serialization.*
import kotlin.reflect.full.memberFunctions

@Serializable @SerialName("Model")
data class Model(
    val eid: Int,
    val agent: String,
    val value: RpcDataClass
) : RpcDataClass

class EntityException(message: String) : Exception(message)

abstract class Entity(register: (Entity) -> Int) : RpcDataClass
{
    val eid = register(this)

    abstract suspend fun invoke(selector: String, args: Array<Any?>): Any?
}

class DocumentEntity(register: (Entity) -> Int, val backing: Backing, agentType: AgentType) : Entity(register)
{
    lateinit var agent: Agent<*>

    init {
        become(agentType)
    }

    private fun become(newType: AgentType) {
        this.agent = buildAgent(backing, newType)
    }

    override suspend fun invoke(selector: String, args: Array<Any?>): Any? {
        return when (selector) {
            "model" -> model()
            "become" -> become(AgentType.valueOf(args[0] as String))
            else -> dynamicDispatch(selector, args)
        }
    }

    private fun model(): Model {
        return Model(this.eid, agent::class.simpleName!!, agent.value())
    }

    private suspend fun dynamicDispatch(selector: String, args: Array<Any?>): Any? {
        for (func in agent::class.memberFunctions) {
            if (func.name == selector) {
                return func.call(agent, *args)
            }
        }
        throw EntityException("Could not find selector ${selector} in this agent")
    }
}

class EntitySerializer<T : Entity>(private val database: Database) : KSerializer<T> {
    @OptIn(kotlinx.serialization.ImplicitReflectionSerializer::class)
    override val descriptor: SerialDescriptor = SerialDescriptor("hostObj") {
        element<String>("type") // always index 0
        element<Int>("value") // always index 1
    }

    override fun serialize(encoder: Encoder, value: T) {
        val composite = encoder.beginStructure(descriptor)
        composite.encodeStringElement(descriptor, 0, "hostObj")
        composite.encodeIntElement(descriptor, 1, value.eid)
        composite.endStructure(descriptor)
    }

    override fun deserialize(decoder: Decoder): T {
        val composite: CompositeDecoder = decoder.beginStructure(descriptor)

        while (true) {
            val elementIndex = composite.decodeElementIndex(descriptor)
            if (elementIndex == 1)
                return database.lookup(composite.decodeIntElement(descriptor, elementIndex)) as T
            else if (elementIndex == CompositeDecoder.READ_DONE)
                throw java.lang.Exception()
        }
    }
}
