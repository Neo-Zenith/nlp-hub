import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Usage } from "./usage.model";
import { Debug } from "src/custom/debug/debug";

@Injectable()
export class UsageService {
    constructor(
        @InjectModel('Usage') private readonly usageModel: Model<Usage>
    ) {}
    
    /**
     * Returns all usage histories from database
     * @returns Array[{@link Usage}]
     */
    async retrieveAll() {
        const payload = await this.usageModel.find().exec()
        return payload;
    }
    
    /**
     * Returns a specific usage history from database
     * @param usageID ID of the target usage history
     * @param userID ID of the user associated with the history
     * @returns JSON {@link Usage}
     */
    async retrieveOne(usageID: string, userID: string) {
        const usage = await this.checkRecordExistence(usageID, userID);

        if (!usage) {
            return false;
        }

        return usage;
    }

    /**
     * Adds a new usage history into database
     * @param userID ID of the user associated with the usage
     * @param serviceID ID of the service chosen by the user 
     * @param input Input text of the usage
     * @param output Output result of the usage
     * @param options Options selected by the user
     * @returns ID of the new usage history record
     */
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
        return usage.id;
    }

    /**
     * Removes a specific usage history from database
     * @param usageID ID of the target usage history to be removed
     * @param userID ID of the user associated with the target usage history
     * @returns Boolean {@linkcode true} if remove is successful; {@linkcode false} otherwise
     */
    async removeUsage(
        usageID: string,
        userID: string
    ) {
        const exist = await this.checkRecordExistence(usageID, userID);
        if (! exist) {
            return false;
        }
        await this.usageModel.deleteOne({_id: usageID});
        return true;
    }

    /**
     * Subroutine used to check if a record exists before performing CRUD operations
     * @param usageID ID of the new/old usage to be inserted/deleted
     * @param userID ID of the user making the request
     * @returns JSON {@link Usage} if a record is found; {@linkcode false} otherwise
     */
    async checkRecordExistence(usageID: string, userID: string) {
        try {
            const usage = await this.usageModel.findOne({_id: usageID, userID: userID});

            if (usage) {
                return usage;
            }
            return false;

        } catch (err) {
            Debug.devLog(userID, err)
            if (err.name === "CastError") {
                return false;
            }
        }
        
    }
    
    // TODO: Overwrites userID constraint to a usageID for administrators
    // Admins can access ALL usage histories, but normal users can only access their own usage
}