import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Nlp, NlpConfig, NlpEndpoint } from "./nlp.model";

@Injectable()
export class NlpService {
    constructor(
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>,
        @InjectModel('NlpEndpoint') private readonly nlpEndpointModel: Model<NlpEndpoint>,
        @InjectModel('NlpConfig') private readonly nlpConfigModel: Model<NlpConfig>
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
        apiEndpoints: NlpEndpoint[],
        apiConfig: NlpConfig[]) {
        const newAPI = new this.nlpModel({
            name: apiName,
            version: apiVersion,
            description: apiDescription,
        })
        const api = await newAPI.save();

        for (let i = 0; i < apiEndpoints.length; i ++) {
            const newAPIEndpoint = new this.nlpEndpointModel({
                serviceID: newAPI.id,
                method: apiEndpoints[i].method,
                options: apiEndpoints[i].options,
                url: apiEndpoints[i].url
            })
            await newAPIEndpoint.save();

            const newAPIConfig = new this.nlpConfigModel({
                serviceID: newAPI.id,
                task: apiConfig[i].task,
                endpointID: newAPIEndpoint.id
            })
            await newAPIConfig.save();
        }

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
        await this.nlpEndpointModel.deleteMany({serviceID: apiID});
        await this.nlpConfigModel.deleteMany({serviceID: apiID});
        await this.nlpModel.deleteOne({_id: apiID});
        return true;
    }

    // Get all services currently registered in the server
    async retrieveAllServices() {
        const payload = await this.nlpModel.find().exec()
        return payload;
    }

    // Get details of a specific API
    async retrieveOneService(apiID: string) {
        const api = await this.checkApiExistence(apiID);
        if (! api) {
            return false;
        }
        return api;
    }

    async retrieveAllEndpoints() {
        const payload = await this.nlpEndpointModel.find().exec();
        return payload;
    }

    async retrieveOneEndpoint(endpointID: string) {
        const endpoint = await this.nlpEndpointModel.findById(endpointID);

        if (!endpoint) {
            return false;
        }

        return endpoint;
    }

    async retrieveEndpointsForOneService(serviceID: string) {
        const endpoints = await this.nlpEndpointModel.find({ serviceID: serviceID }).exec();
        if (!endpoints) {
            return false;
        }

        return endpoints;
    }

    // Check if API exists before performing modification to DB
    private async checkApiExistence(apiID: string) {
        const api = await this.nlpModel.findById(apiID);;
        const endpoint = await this.nlpEndpointModel.find({serviceID: apiID});

        if (! api || ! endpoint) {
            return false;
        }
        return api;
    }
}
