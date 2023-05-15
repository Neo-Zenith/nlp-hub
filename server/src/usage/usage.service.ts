import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Usage } from "./usage.model";

@Injectable()
export class UsageService {
    constructor(
        @InjectModel('Usage') private readonly usageModel: Model<Usage>
    ) {}
    
    async retrieveAll() {
        const payload = await this.usageModel.find().exec()
        return { payload: payload };
    }
    
    async retrieveOne(usageID: string, userID: string) {
        const usage = await this.checkRecordExistence(usageID, userID);
        return usage as Usage;
    }

    async addUsage(
            userID: string, 
            serviceID: string,
            input: string, 
            output: string, 
            options: Record<string, string>) {
        const newUsage = new this.usageModel({
            userID: userID,
            serviceID: serviceID,
            input: input,
            output: output,
            options: options
        })
        const usage = await newUsage.save();
        return usage.id as string;
    }

    async removeUsage(
        usageID: string,
        userID: string
    ) {
        await this.checkRecordExistence(usageID, userID);
        await this.usageModel.deleteOne({_id: usageID});
        return {message: "Removed usage record"}
    }

    async checkRecordExistence(usageID: string, userID: string) {
        const usage = await this.usageModel.findOne({_id: usageID, userID: userID});

        if (usage) {
            return usage as Usage;
        }

        throw new HttpException('Record Not Found', HttpStatus.NOT_FOUND);
    }
}