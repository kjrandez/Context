package com.kjrandez.context.kernel.entity

import com.kjrandez.context.kernel.Database
import com.kjrandez.context.kernel.Ledger
import com.kjrandez.context.kernel.RpcDataClass
import kotlinx.serialization.*
import kotlin.reflect.full.callSuspend
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

class DocumentEntity(
    register: (Entity) -> Int,
    private val backing: Backing,
    var agentType: AgentType,
    private val ledger: Ledger
) : Entity(register)
{
    lateinit var agent: Agent<*>

    init {
        become(agentType)
    }

    private fun become(newType: AgentType) {
        this.agent = buildAgent(backing, newType, ledger)
        this.agentType = newType
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
                return func.callSuspend(agent, *args)
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
        val dec: CompositeDecoder = decoder.beginStructure(descriptor)
        var value: Int? = null // need to read nullable non-optional properties
        loop@ while (true) {
            when (val i = dec.decodeElementIndex(descriptor)) {
                CompositeDecoder.READ_DONE -> break@loop
                0 -> dec.decodeStringElement(descriptor, i)
                1 -> value = dec.decodeIntElement(descriptor, i)
                else -> throw SerializationException("Unknown index $i")
            }
        }
        dec.endStructure(descriptor)

        if (value == null)
            throw SerializationException("Missing key: value")

        return database.lookup(value) as T
    }
}
