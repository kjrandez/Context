package com.kjrandez.context.kernel.entity

import com.kjrandez.context.kernel.RpcDataClass
import kotlinx.serialization.Serializable

interface Backing

@Serializable
data class FileBacking(val path: String) : Backing

@Serializable
data class InternalBacking<T: RpcDataClass>(val value: T) : Backing
