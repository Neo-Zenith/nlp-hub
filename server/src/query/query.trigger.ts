import { UserModel } from "src/users/user.model";
import { HttpException, HttpStatus } from "@nestjs/common";
import { QuerySchema } from "./query.model";
import { NlpEndpointModel, NlpModel } from "src/nlp/nlp.model";

// Pre-save trigger for Query
export function QueryTrigger() {
    QuerySchema.pre('save', async function(next) {
        // FK constraint check for userID
        const user = await UserModel.findById(this.userID);
        if (! user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }

        // FK constraint check for serviceID
        const service = await NlpModel.findById(this.serviceID);
        if (! service) {
            throw new HttpException("Service not found", HttpStatus.NOT_FOUND);
        }

        // FK constraint check for endpointID
        const endpoint = (await NlpEndpointModel.findById(this.endpointID).exec()).toJSON();
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND)
        }

        return next();
})}