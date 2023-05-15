import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getModelForClass } from '@typegoose/typegoose';
import { Document } from 'mongoose';

/**
 * Nlp(id, name, version, description, endpoints)
 * PK: id
 * NOT NULL: name, version, endpoints
 */
@Schema()
export class Nlp extends Document {
    @Prop( {required: true} )
    name: string;

    @Prop( {required: true} )
    version: string;

    @Prop()
    description: string;

    @Prop( {required: true} )
    endpoints: string[];
}

export const NlpSchema = SchemaFactory.createForClass(Nlp);
export const NlpModel = getModelForClass(Nlp);

