package com.kjrandez.context.kernel.entity

data class TextModel(var content: String) : EntityBacking()

class Text(context: EntityAgentContext) : EntityAgent(context)
{
    fun test() { print("Hello world!") }
}
