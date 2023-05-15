import { HttpException, HttpStatus } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { Nlp, NlpSchema } from "src/nlp/nlp.model";
import { User, UserSchema } from "src/users/user.model";


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
UsageSchema.pre('validate', async function (next) {
    const usage = this;
    var User = mongoose.model('User', UserSchema);
    var Service = mongoose.model('Nlp', NlpSchema);

    try {
        await User.findOne({_id: usage.userID});
    } catch (err) {
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
    }    

    try {
        await Service.findOne({_id: usage.serviceID});
    } catch (err) {
        throw new HttpException('Service Not Found', HttpStatus.NOT_FOUND)
    }

    return next();
});
