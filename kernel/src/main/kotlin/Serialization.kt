package com.kjrandez.context.kernel

import com.kjrandez.context.kernel.entity.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonConfiguration
import kotlinx.serialization.modules.SerializersModule

fun rpcJson(database: Database) = Json(context= SerializersModule {
    polymorphic(RpcArgument::class) {
        RpcInt::class with RpcInt.serializer()
        RpcFloat::class with RpcFloat.serializer()
        RpcString::class with RpcString.serializer()
        RpcBool::class with RpcBool.serializer()
        RpcList::class with RpcList.serializer()
        RpcDict::class with RpcDict.serializer()
        RpcHostObj::class with RpcHostObj.serializer()
        RpcClientObj::class with RpcClientObj.serializer()
        RpcData::class with RpcData.serializer()
    }
    polymorphic(RpcMessage::class) {
        RpcCall::class with RpcCall.serializer()
        RpcSend::class with RpcSend.serializer()
        RpcYield::class with RpcYield.serializer()
        RpcError::class with RpcError.serializer()
    }
    polymorphic(Backing::class) {
        FileBacking::class with FileBacking.serializer()
    }
    polymorphic(RpcDataClass::class) {
        Model::class with Model.serializer()
        TextValue::class with TextValue.serializer()
        PageValue::class with PageValue.serializer()
        PageEntry::class with PageEntry.serializer()
    }
    contextual(Entity::class, EntitySerializer(database))
    contextual(DocumentEntity::class, EntitySerializer(database))
}, configuration = JsonConfiguration(prettyPrint=true))
