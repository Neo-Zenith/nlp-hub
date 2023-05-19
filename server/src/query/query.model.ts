import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { Nlp, NlpEndpoint } from "src/nlp/nlp.model";
import { User } from "src/users/user.model";
import { QueryTrigger } from "./query.trigger";

/**
 * Query(id, userID, serviceID, input, output, options)
 */
@Schema()
export class Query extends Document {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    userID: string;

    @Prop({ required: true, default: Date.now })
    dateTime: Date;

    @Prop({ type: Types.ObjectId, ref: Nlp.name, required: true })
    serviceID: string;

    @Prop({ type: Types.ObjectId, ref: NlpEndpoint.name, required: true })
    endpointID: string;

    @Prop({ required: true })
    output: string;

    @Prop({ type: Types.Map, ref: NlpEndpoint.name, of: String })
    options: Record<string, string>;
}

export const QuerySchema = SchemaFactory.createForClass(Query);
export const QueryModel = mongoose.model('Query', QuerySchema);
QueryTrigger();