import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Usage } from "./usage.model";
import { Debug } from "src/custom/debug/debug";

@Injectable()
export class UsageService {
    constructor(
        @InjectModel('Usage') private readonly usageModel: Model<Usage>
    ) {}

    async retrieveAllUsagesForUser(userID: string) {
        const usages = await this.usageModel.find({userID: userID});
        return usages;
    }
    
    async retrieveAllUsagesForAdmin() {
        const usages = await this.usageModel.find().exec()
        return usages;
    }
    
    async retrieveOneUsageForUser(usageID: string, userID: string) {
        const usage = await this.checkUsageExistence(usageID, userID);

        if (! usage) {
            throw new HttpException("Usage not found", HttpStatus.NOT_FOUND)
        }

        return usage;
    }

    async retrieveOneUsageForAdmin(usageID: string) {
        const usage = await this.usageModel.findById(usageID);

        if (! usage) {
            throw new HttpException("Usage not found", HttpStatus.NOT_FOUND)
        }
        
        return usage;
    }

    async addUsage(
            userID: string, 
            serviceID: string,
            endpointID: string,
            input: string, 
            output: string, 
            options: Record<string, string>) {

        const newUsage = new this.usageModel({
            userID: userID,
            serviceID: serviceID,
            endpointID: endpointID,
            input: input,
            output: output,
            options: options
        })

        const usage = await newUsage.save();
        return usage.id;
    }

    async removeUsage(
        usageID: string,
        userID: string
    ) {
        const usage = await this.checkUsageExistence(usageID, userID);
        if (! usage) {
            throw new HttpException("Usage not found", HttpStatus.NOT_FOUND)
        }
        await this.usageModel.deleteOne({_id: usageID});
        return {
            message: "Service deleted"
        };
    }

    async checkUsageExistence(usageID: string, userID: string) {
        const usage = await this.usageModel.findOne({_id: usageID, userID: userID});

        if (usage) {
            return usage;
        }
        return false;
    }
    
    // TODO: Overwrites userID constraint to a usageID for administrators
    // Admins can access ALL usage histories, but normal users can only access their own usage
}