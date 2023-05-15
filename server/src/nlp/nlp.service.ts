import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Nlp } from "./nlp.model";

@Injectable()
export class NlpService {
    constructor(
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>
    ) {}

    /**
     * Register API 
     * @param apiName Name of the API
     * @param apiVersion Version of the API
     * @param apiDescription Description of the API
     * @param apiEndpoints Endpoints of the API
     * @returns ID of the registered API
     */
    async subscribe(
        apiName: string, 
        apiVersion: string, 
        apiDescription: string, 
        apiEndpoints: string[],
        apiOptions: Record<string, string>) {
        const newAPI = new this.nlpModel({
            name: apiName,
            version: apiVersion,
            description: apiDescription,
            endpoints: apiEndpoints,
            options: apiOptions
        })

        const api = await newAPI.save();
        return api.id;
    }

    /**
     * Unregister API from service
     * @param apiID ID of the API to be unregistered
     * @returns Boolean {@linkcode true} if successful unregister; {@linkcode false} otherwise
     */
    async unsubscribe(apiID: string) {
        const apiExist = await this.checkApiExistence(apiID);
        if (! apiExist) {
            return false;
        }
        await this.nlpModel.deleteOne({_id: apiID});
        return true;
    }

    /**
     * Get all APIs currently registered
     * @returns Array[{@link Nlp}]
     */
    async retrieveAll() {
        const payload = await this.nlpModel.find().exec()
        return payload;
    }

    /**
     * Get a specific API
     * @param apiID ID of the target API
     * @returns Boolean {@linkcode false} if the ID is invalid; JSON {@link Nlp} otherwise
     */
    async retrieveOne(apiID: string) {
        const api = await this.checkApiExistence(apiID);
        if (! api) {
            return false;
        }
        return api;
    }

    /**
     * Subroutine to verify if API is valid in db
     * @param apiID ID of the target API
     * @returns Boolean {@linkcode false} if not found; JSON {@link Nlp} otherwise
     */
    private async checkApiExistence(apiID: string) {
        const api = await this.nlpModel.findById(apiID);
        if (! api) {
            return false;
        }
        return api;
    }
}
