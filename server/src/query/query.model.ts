import { HttpException, HttpStatus } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { getModelForClass } from "@typegoose/typegoose";
import mongoose, { Document, Types } from "mongoose";
import { Nlp, NlpEndpoint, NlpEndpointModel, NlpModel } from "src/nlp/nlp.model";
import { UsageController } from "src/usage/usage.controller";
import { UsageModel } from "src/usage/usage.model";
import { UsageService } from "src/usage/usage.service";
import { User, UserModel } from "src/users/user.model";

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
    input: string;

    @Prop({ required: true })
    output: string;

    @Prop({ type: Types.Map, ref: NlpEndpoint.name, of: String })
    options: Record<string, string>;
}

export const QuerySchema = SchemaFactory.createForClass(Query);
export const QueryModel = mongoose.model('Query', QuerySchema);

// Pre-save trigger for Query
QuerySchema.pre('save', async function(next) {
    // FK constraint check for userID
    const user = await UserModel.findById(this.userID);
    if (!user) {
        throw new HttpException("User Not Found", HttpStatus.NOT_FOUND);
    }

    // FK constraint check for serviceID
    const api = await NlpModel.findById(this.serviceID);
    if (!api) {
        throw new HttpException("Service Not Found", HttpStatus.NOT_FOUND);
    }

    // FK constraint check for endpointID
    const endpoint = (await NlpEndpointModel.findById(this.endpointID).exec()).toJSON();
    if (!endpoint) {
        throw new HttpException("Endpoint Not Found!", HttpStatus.NOT_FOUND)
    }

    // FK constraint check for the JSON options object
    const queryOptions = Object.keys(this.options);
    const nlpEndpointOptions = Object.keys(endpoint.options);
    if (queryOptions.length !== nlpEndpointOptions.length) {
        throw new HttpException(
            "Invalid Request (Options Do Not Match Predefined Parameters)", 
            HttpStatus.BAD_REQUEST);
    }

    for (const key of queryOptions) {
        if (!nlpEndpointOptions.includes(key)) {
            throw new HttpException(
                "Invalid Request (Options Do Not Match Predefined Parameters)", 
                HttpStatus.BAD_REQUEST);
        }
    }

    // save to usage before exiting
    const usage = new UsageModel({
        userID: this.userID,
        serviceID: this.serviceID,
        endpointID: this.endpointID,
        input: this.input,
        output: this.output,
        options: this.options
    })
    await usage.save();

    return next();
})