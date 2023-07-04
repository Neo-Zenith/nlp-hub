import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document, Types } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import { QueryTrigger } from './queries.trigger'

/**
 * Query(id, userID, serviceID, input, output, options)
 */
@Schema()
export class Query extends Document {
    @Prop({ default: uuidv4, unique: true, type: String })
    uuid: string

    @Prop({ type: Types.ObjectId, required: true })
    userID: string

    @Prop({ required: true, default: Date.now, type: Date })
    dateTime: Date

    @Prop({ type: Types.ObjectId, required: true })
    serviceID: string

    @Prop({ type: String, required: true })
    type: string

    @Prop({ type: String, required: true })
    version: string

    @Prop({ type: Types.ObjectId, required: true })
    endpointID: string

    @Prop({ required: true, type: String })
    output: string

    @Prop({ required: true, type: Number })
    executionTime: number

    @Prop({ type: Types.Map, of: String })
    options: Record<string, string>

    @Prop({ required: true, default: false, type: Boolean })
    isAdminQuery: boolean
}

export const QuerySchema = SchemaFactory.createForClass(Query)
QueryTrigger()
export const QueryModel = mongoose.model('Query', QuerySchema)
