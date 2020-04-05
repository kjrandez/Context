package com.kjrandez.context.kernel.entity

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

class Page(val backingValue: PageValue) : Agent<PageValue>()
{
    override fun value(): PageValue {
        return backingValue
    }
}
