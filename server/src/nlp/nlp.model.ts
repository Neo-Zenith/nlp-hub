import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { NlpConfigTrigger, NlpEndpointTrigger, NlpTrigger } from './nlp.trigger';

/**
 * Nlp(id, name, version, description)
 * PK: id
 * NOT NULL: name, version
 */
@Schema()
export class Nlp extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    version: string;

    @Prop({ required: true })
    address: string;

    @Prop()
    description: string;
}

/**
 * NlpEndpoint(id, serviceID, method, options, url)
 * PK: id
 * FK: serviceID
 * NOT NULL: method, url
 */
@Schema()
export class NlpEndpoint extends Document {
    @Prop({ type: Types.ObjectId, ref: Nlp.name, required: true })
    serviceID: string;

    @Prop({ required: true })
    method: string;

    @Prop({ type: Map, of: String })
    options: Record<string, any>;

    @Prop({ required: true })
    endpoint: string;
} 

/**
 * NlpConfig(id, serviceID, task, endpointID)
 * PK: id
 * FK: serviceID, endpointID
 * NOT NULL: task
 */
@Schema()
export class NlpConfig extends Document {
    @Prop({ type: Types.ObjectId, ref: Nlp.name, required: true })
    serviceID: string;

    @Prop({ required: true })
    task: string;

    @Prop({ type: Types.ObjectId, ref: NlpEndpoint.name, required: true })
    endpointID: string;
}

export const NlpSchema = SchemaFactory.createForClass(Nlp);
export const NlpModel = mongoose.model('Nlp', NlpSchema);

export const NlpEndpointSchema = SchemaFactory.createForClass(NlpEndpoint);
export const NlpEndpointModel = mongoose.model('NlpEndpoint', NlpEndpointSchema);

export const NlpConfigSchema = SchemaFactory.createForClass(NlpConfig);
export const NlpConfigModel = mongoose.model('NlpConfig', NlpConfigSchema);

NlpTrigger();
NlpEndpointTrigger();
NlpConfigTrigger();

