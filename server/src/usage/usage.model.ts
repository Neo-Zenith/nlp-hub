import { HttpException, HttpStatus } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";
import { Nlp, NlpModel, NlpSchema } from "src/nlp/nlp.model";
import { User, UserModel, UserSchema } from "src/users/user.model";


@Schema()
export class Usage {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    userID: User['_id'];

    @Prop({
        default: () => {
        const now = new Date();
        return now;
        },
    })
    dateTime: Date;

    @Prop({ type: Types.ObjectId, ref: Nlp.name, required: true })
    serviceID: Nlp['_id'];

    @Prop()
    input: string;

    @Prop()
    output: string;

    @Prop({ type: Map, of: String })
    options: Record<string, string>;
}

export const UsageSchema = SchemaFactory.createForClass(Usage);

// foreign key constraint trigger
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
