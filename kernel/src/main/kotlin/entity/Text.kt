package com.kjrandez.context.kernel.entity

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

import com.kjrandez.context.kernel.RpcDataClass

@Serializable @SerialName("TextValue")
data class TextValue(var content: String) : RpcDataClass

interface TextValueProvider
{
    fun value(): TextValue
}

class InternalTextValueProvider(val backingValue: TextValue) : TextValueProvider
{
    override fun value(): TextValue {
        return backingValue
    }
}

class FileTextValueProvider(val backing: FileBacking) : TextValueProvider
{
    override fun value(): TextValue {
        return TextValue("file contents")
    }
}

class Text(val provider: TextValueProvider) : Agent<TextValue>()
{
    constructor(backingValue: TextValue) : this(InternalTextValueProvider(backingValue))
    constructor(backing: FileBacking) : this(FileTextValueProvider(backing))

    override fun value(): TextValue {
        return provider.value()
    }
}
