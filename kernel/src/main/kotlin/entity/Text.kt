package com.kjrandez.context.kernel.entity

data class TextModel(var content: String) : Backing()

class Text(context: AgentContext) : Agent(context)
{
    fun test() { print("Hello world!") }
}
