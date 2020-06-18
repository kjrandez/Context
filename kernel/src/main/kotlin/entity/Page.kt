package com.kjrandez.context.kernel.entity

import com.kjrandez.context.kernel.Ledger
import com.kjrandez.context.kernel.RpcDataClass
import kotlinx.serialization.ContextualSerialization
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable @SerialName("PageEntry")
data class PageEntry(
    val index: Int,

    @ContextualSerialization
    val entity: DocumentEntity
) : RpcDataClass

@Serializable @SerialName("PageValue")
data class PageValue(val entries: MutableList<PageEntry>) : RpcDataClass {
    private var nextIndex: Int = {
        var max = 0
        entries.map { if (it.index > max) max = it.index }
        max + 1
    }()

    fun entry(entity: DocumentEntity) = PageEntry(nextIndex++, entity)
}

class Page(val backingValue: PageValue, ledger: Ledger) : Agent<PageValue>(ledger)
{
    override fun value(): PageValue {
        return backingValue
    }

    suspend fun append(inst: DocumentEntity) {
        val entry = backingValue.entry(inst)

        transaction(
            "Append page entry",
            { backingValue.entries.add(entry) },
            { backingValue.entries.remove(entry) }
        )
    }

    suspend fun removeIndex(index: Int) {
        val position = backingValue.entries.indexOfFirst { it.index == index }
        val entry = backingValue.entries[position]

        transaction(
            "Remove page entry",
            { backingValue.entries.remove(entry) },
            { backingValue.entries.add(position, entry) }
        )
    }

    suspend fun insertBeforeIndex(index: Int, entity: DocumentEntity) {
        val position = backingValue.entries.indexOfFirst { it.index == index }
        val entry = backingValue.entry(entity)

        transaction(
            "Insert page entry",
            { backingValue.entries.add(position, entry) },
            { backingValue.entries.remove(entry) }
        )
    }
}
