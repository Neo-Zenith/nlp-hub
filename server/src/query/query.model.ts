import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { getModelForClass } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { Nlp } from "src/nlp/nlp.model";
import { User } from "src/users/user.model";

/**
 * Query(id, userID, serviceID, input, output, options)
 */
@Schema()
export class Query {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    userID: string;

    @Prop({ required: true, default: Date.now })
    dateTime: Date;

    @Prop({ type: Types.ObjectId, ref: Nlp.name, required: true })
    serviceID: string;

    @Prop({ required: true })
    input: string;

    @Prop({ required: true })
    output: string;

    @Prop({ type: Map, of: String })
    options: Record<string, string>;
}

export const QuerySchema = SchemaFactory.createForClass(Query);
export const QueryModel = getModelForClass(Query);