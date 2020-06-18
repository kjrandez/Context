package com.kjrandez.context.kernel.entity

import com.kjrandez.context.kernel.Ledger
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

class Text(val provider: TextValueProvider, ledger: Ledger) : Agent<TextValue>(ledger)
{
    constructor(backingValue: TextValue, ledger: Ledger) : this(InternalTextValueProvider(backingValue), ledger)
    constructor(backing: FileBacking, ledger: Ledger) : this(FileTextValueProvider(backing), ledger)

    override fun value(): TextValue {
        return provider.value()
    }
}
