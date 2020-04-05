package com.kjrandez.context.kernel.entity

import com.kjrandez.context.kernel.RpcDataClass

enum class AgentType {
    Page, Text
}

abstract class Agent<T : RpcDataClass>
{
    abstract fun value(): T
}

fun buildPageAgent(backing: Backing): Agent<PageValue> {
    return when(backing) {
        is InternalBacking<*> -> when (backing.value) {
            is PageValue -> Page(backing.value)
            else -> throw EntityException("Can not build Page with that internal backing class")
        }
        else -> throw EntityException("Can not build Page with that backing type")
    }
}

fun buildTextAgent(backing: Backing): Agent<TextValue> {
    return when(backing) {
        is InternalBacking<*> -> when (backing.value) {
            is TextValue -> Text(backing.value)
            else -> throw EntityException("Can't build Text with internal backing class ${backing::class}")
        }
        is FileBacking -> Text(backing)
        else -> throw EntityException("Can not build Text with that backing type")
    }
}

fun buildAgent(backing: Backing, agentType: AgentType): Agent<*> {
    return when (agentType) {
        AgentType.Page -> buildPageAgent(backing)
        AgentType.Text -> buildTextAgent(backing)
    }
}
