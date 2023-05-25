import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { NlpTrigger } from './nlp.trigger';

/**
 * Nlp(id, name, version, address, description)
 * PK: id
 * UNIQUE: address
 * NOT NULL: name, version, address
 */

export enum NlpTypes {
    SUD = 'SUD',
    NER = 'NER'
}

export enum MethodTypes {
    POST = 'POST',
    GET = 'GET',
    PUT = 'PUT',
    DELETE = 'DELETE',
    UPDATE = 'UPDATE'
}

@Schema()
export class Nlp extends Document {
    @Prop({ required: true, index: 'text' })
    name: string;

    @Prop()
    version: string;

    @Prop({ required: true, unique: true })
    baseAddress: string;

    @Prop()
    description: string;

    @Prop({ required: true, enum: NlpTypes })
    type: string;
}

/**
 * NlpEndpoint(id, serviceID, method, options, endpoint, task)
 * PK: id
 * FK: serviceID => Nlp(id)
 * UNIQUE: <serviceID, endpoint, method>, <serviceID, task>
 * NOT NULL: serviceID, method, endpoint, task
 */
@Schema()
export class NlpEndpoint extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Nlp', required: true })
    serviceID: string;

    @Prop({ required: true, enum: MethodTypes })
    method: string;

    @Prop({ type: Map, of: String })
    options: Record<string, any>;

    @Prop({ required: true })
    endpointPath: string;

    @Prop({ required: true, index: 'text' })
    task: string;
} 

export const NlpSchema = SchemaFactory.createForClass(Nlp);
NlpSchema.index({ type: 1, version: 1 }, { unique: true });
NlpTrigger();
export const NlpModel = mongoose.model('Nlp', NlpSchema);

export const NlpEndpointSchema = SchemaFactory.createForClass(NlpEndpoint);
NlpEndpointSchema.index({ serviceID: 1, endpointPath: 1, method: 1}, { unique: true })
NlpEndpointSchema.index({ serviceID: 1, task: 1 }, { unique: true })
export const NlpEndpointModel = mongoose.model('NlpEndpoint', NlpEndpointSchema);


