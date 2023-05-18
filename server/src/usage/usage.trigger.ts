import { UserModel } from "src/users/user.model";
import { UsageSchema } from "./usage.model";
import { NlpModel } from "src/nlp/nlp.model";
import { HttpException, HttpStatus } from "@nestjs/common";

export function UsageTrigger() {
    UsageSchema.pre('save', async function (next) {
        const user = await UserModel.findById(this.userID);
        const service = await NlpModel.findById(this.serviceID);
        if (! user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND)  
        }
        if (! service) {
            throw new HttpException('Service not found', HttpStatus.NOT_FOUND)
        }
    
        return next();
    });
}
