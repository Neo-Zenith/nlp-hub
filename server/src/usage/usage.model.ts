import { HttpException, HttpStatus } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { getModelForClass } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { NlpModel } from "src/nlp/nlp.model";
import { Query } from "src/query/query.model";
import { UserModel } from "src/users/user.model";

/**
 * Usage (userID, dateTime, serviceID, input, output, options, completed)
 * PK: usageID
 * FK: userID, serviceID
 * NOT NULL: dateTime, input, output, completed
 */
@Schema()
export class Usage extends Query{
    @Prop( {required: true, default: false})
    completed: boolean;
}

export const UsageSchema = SchemaFactory.createForClass(Usage);
export const UsageModel = mongoose.model('Usage', UsageSchema)

/**
 * Foreign key constraint trigger
 * CHECKS: EXISTS userID IN User; EXISTS serviceID IN Nlp
 */
UsageSchema.pre('save', async function (next) {
    const usage = this;
    const user = await UserModel.findById(usage.userID);
    const service = await NlpModel.findById(usage.serviceID);
    if (!user) {
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)  
    }
    if (!service) {
        throw new HttpException('Service Not Found', HttpStatus.NOT_FOUND)
    }

    return next();
});
