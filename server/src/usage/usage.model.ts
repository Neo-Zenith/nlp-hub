import { HttpException, HttpStatus } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { getModelForClass } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { Nlp, NlpModel } from "src/nlp/nlp.model";
import { User, UserModel } from "src/users/user.model";

/**
 * Usage (userID, dateTime, serviceID, input, output, options)
 * PK: usageID
 * FK: userID, serviceID
 * NOT NULL: dateTime, input, output
 */
@Schema()
export class Usage {
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

export const UsageSchema = SchemaFactory.createForClass(Usage);
export const UsageModel = getModelForClass(Usage);

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
