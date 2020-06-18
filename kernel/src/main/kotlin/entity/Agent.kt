package com.kjrandez.context.kernel.entity

import com.kjrandez.context.kernel.Ledger
import com.kjrandez.context.kernel.RpcDataClass

enum class AgentType {
    Page, Text
}

abstract class Agent<T : RpcDataClass>(private val ledger: Ledger)
{
    abstract fun value(): T

    protected suspend fun transaction(description: String, forward: () -> Unit, backward: () -> Unit) {
        return ledger.transaction(description, forward, backward)
    }
}

fun buildPageAgent(backing: Backing, ledger: Ledger): Agent<PageValue> {
    return when(backing) {
        is InternalBacking<*> -> when (backing.value) {
            is PageValue -> Page(backing.value, ledger)
            else -> throw EntityException("Can not build Page with that internal backing class")
        }
        else -> throw EntityException("Can not build Page with that backing type")
    }
}

fun buildTextAgent(backing: Backing, ledger: Ledger): Agent<TextValue> {
    return when(backing) {
        is InternalBacking<*> -> when (backing.value) {
            is TextValue -> Text(backing.value, ledger)
            else -> throw EntityException("Can't build Text with internal backing class ${backing::class}")
        }
        is FileBacking -> Text(backing, ledger)
        else -> throw EntityException("Can not build Text with that backing type")
    }
}

fun buildAgent(backing: Backing, agentType: AgentType, ledger: Ledger): Agent<*> {
    return when (agentType) {
        AgentType.Page -> buildPageAgent(backing, ledger)
        AgentType.Text -> buildTextAgent(backing, ledger)
    }
}
