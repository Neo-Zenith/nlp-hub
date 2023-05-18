import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Query } from "src/query/query.model";
import { UsageTrigger } from "./usage.trigger";

/**
 * Usage (id, userID, dateTime, serviceID, input, output, options, completed)
 * PK: id
 * FK: userID, serviceID
 * NOT NULL: userID, serviceID, dateTime, input, output, completed 
 */
@Schema()
export class Usage extends Query{
    @Prop( {required: true, default: false})
    completed: boolean;
}

export const UsageSchema = SchemaFactory.createForClass(Usage);
export const UsageModel = mongoose.model('Usage', UsageSchema);

UsageTrigger();