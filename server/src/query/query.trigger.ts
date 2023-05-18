import { UsageModel } from "src/usage/usage.model";
import { UserModel } from "src/users/user.model";
import { HttpException, HttpStatus } from "@nestjs/common";
import { QuerySchema } from "./query.model";
import { NlpEndpointModel, NlpModel } from "src/nlp/nlp.model";

// Pre-save trigger for Query
export function QueryTrigger() {
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
})}