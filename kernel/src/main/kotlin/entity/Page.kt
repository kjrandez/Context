package com.kjrandez.context.kernel.entity

data class PageModel(val entries: MutableList<PageEntry>) : EntityBacking() {
    data class PageEntry(val index: Int, val entity: Entity)

    private var nextIndex: Int = {
        var max = 0
        entries.map { if (it.index > max) max = it.index }
        max + 1
    }()

    fun entry(entity: Entity) =
        PageEntry(nextIndex++, entity)
}

class Page(context: EntityAgentContext) : EntityAgent(context)
{
    fun other() { print("How are you doing?") }
}
