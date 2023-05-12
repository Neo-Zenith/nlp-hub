import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Nlp } from "./nlp.model";

@Injectable()
export class NlpService {
    constructor(
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>
    ) {}

    // register API
    async subscribe(apiName: string, apiVersion: string, apiDescription: string, apiEndpoints: string[]) {
        const newAPI = new this.nlpModel({
            name: apiName,
            version: apiVersion,
            description: apiDescription,
            endpoints: apiEndpoints
        })

        const api = await newAPI.save();
        return api.id as string;
    }

    // unregister API
    async unsubscribe(apiID: string) {
        await this.checkApiExistence(apiID);
        await this.nlpModel.deleteOne({_id: apiID});
        return {message: "API unsubscribed from services"}
    }

    // get all APIs currently registered
    async retrieveAll() {
        const payload = await this.nlpModel.find().exec()
        return {payload: payload};
    }

    // get specific API
    async retrieveOne(apiID: string) {
        const api = await this.checkApiExistence(apiID);
        return api as Nlp;
    }

    // subroutine to verify if API is valid in db
    private async checkApiExistence(apiID: string) {
        const api = await this.nlpModel.findById(apiID);
        if (! api) {
            throw new HttpException("API not found", HttpStatus.NOT_FOUND)
        }
        return api as Nlp;
    }
}
