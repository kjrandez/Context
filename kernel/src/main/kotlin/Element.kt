package com.kjrandez.context.kernel

data class Model(val eid: Int, val type: String, val value: Map<String, Any>)

abstract class Element(val type: String)
{
    companion object Static {
        val elementMap: MutableMap<Int, Element> = mutableMapOf()
        var nextIndex = 0
    }

    val eid = nextIndex

    init {
        elementMap[nextIndex] = this
        nextIndex++
    }

    abstract fun value(): Map<String, Any>
    fun model() = Model(eid, type, value())
}

class Text(var content: String) : Element("Text")
{
    override fun value() = mapOf(
        "content" to content
    )
}

class Page(val content: List<Element>) : Element("Page")
{
    data class PageEntry(val elem: Element) {
        companion object Static {
            var nextIndex = 0
        }
        val index = nextIndex++
    }

    val entries = content.map { PageEntry(it) }.toMutableList()

    override fun value(): Map<String, Any> = mapOf(
        "entries" to entries
    )
}
