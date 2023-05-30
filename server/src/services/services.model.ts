import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document, Types } from 'mongoose'
import { ServiceTrigger } from './services.trigger'

/**
 * Nlp(id, name, version, address, description)
 * PK: id
 * UNIQUE: address
 * NOT NULL: name, version, address
 */

export enum ServiceType {
    SUD = 'SUD',
    NER = 'NER',
}

export enum HttpMethodType {
    POST = 'POST',
    GET = 'GET',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

@Schema()
export class Service extends Document {
    @Prop({ required: true, index: 'text' })
    name: string

    @Prop()
    version: string

    @Prop({ required: true, unique: true })
    baseAddress: string

    @Prop({ required: true })
    description: string

    @Prop({ required: true, enum: ServiceType })
    type: string
}

/**
 * NlpEndpoint(id, serviceID, method, options, endpoint, task)
 * PK: id
 * FK: serviceID => Nlp(id)
 * UNIQUE: <serviceID, endpoint, method>, <serviceID, task>
 * NOT NULL: serviceID, method, endpoint, task
 */
@Schema()
export class ServiceEndpoint extends Document {
    @Prop({ type: Types.ObjectId, required: true })
    serviceID: string

    @Prop({ type: String, required: true, enum: HttpMethodType })
    method: string

    @Prop({ type: Map, of: String })
    options: Record<string, any>

    @Prop({ type: String, required: true })
    endpointPath: string

    @Prop({ type: String, required: true })
    task: string
}

export const ServiceSchema = SchemaFactory.createForClass(Service)
ServiceSchema.index({ type: 1, version: 1 }, { unique: true })
ServiceTrigger()
export const ServiceModel = mongoose.model('Service', ServiceSchema)

export const ServiceEndpointSchema = SchemaFactory.createForClass(ServiceEndpoint)
ServiceEndpointSchema.index({ serviceID: 1, endpointPath: 1, method: 1 }, { unique: true })
ServiceEndpointSchema.index({ serviceID: 1, task: 1 }, { unique: true })
export const ServiceEndpointModel = mongoose.model('ServiceEndpoint', ServiceEndpointSchema)
