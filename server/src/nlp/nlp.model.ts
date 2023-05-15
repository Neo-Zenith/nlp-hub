import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getModelForClass } from '@typegoose/typegoose';
import { Document } from 'mongoose';

@Schema()
export class Nlp extends Document {
    @Prop()
    name: string;

    @Prop()
    version: string;

    @Prop()
    description: string;

    @Prop()
    endpoints: string[];
}

export const NlpSchema = SchemaFactory.createForClass(Nlp);
export const NlpModel = getModelForClass(Nlp);

