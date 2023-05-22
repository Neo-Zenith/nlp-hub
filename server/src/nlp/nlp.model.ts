import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { NlpEndpointTrigger, NlpTrigger } from './nlp.trigger';

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

    @Prop({ required: true })
    version: string;

    @Prop({ required: true })
    baseAddress: string;

    @Prop()
    description: string;

    @Prop({ required: true, enum: NlpTypes, index: true })
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
export const NlpModel = mongoose.model('Nlp', NlpSchema);

export const NlpEndpointSchema = SchemaFactory.createForClass(NlpEndpoint);
export const NlpEndpointModel = mongoose.model('NlpEndpoint', NlpEndpointSchema);

NlpTrigger();
NlpEndpointTrigger();

