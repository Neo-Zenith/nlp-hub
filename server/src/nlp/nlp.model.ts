import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getModelForClass } from '@typegoose/typegoose';
import { Document, Types } from 'mongoose';

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

    @Prop()
    description: string;
}

export class NlpEndpoint {
    @Prop({ type: Types.ObjectId, ref: Nlp.name, required: true })
    serviceID: string;

    @Prop({ required: true, type: Map, of: String })
    options: Record<string, any>;

    @Prop({ required: true })
    url: string;
} 

export const NlpSchema = SchemaFactory.createForClass(Nlp);
export const NlpModel = getModelForClass(Nlp);
export const NlpEndpointSchema = SchemaFactory.createForClass(NlpEndpoint);
export const NlpEndpointModel = getModelForClass(NlpEndpoint);

