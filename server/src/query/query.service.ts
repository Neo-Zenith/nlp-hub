import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Query } from "./query.model";
import { Model } from "mongoose";
import axios from 'axios';
import { Nlp, NlpConfig, NlpEndpoint, NlpEndpointModel, NlpModel } from "src/nlp/nlp.model";

@Injectable() 
export class QueryService {
    constructor(
        @InjectModel('Query') private readonly queryModel: Model<Query>,
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>,
        @InjectModel('NlpEndpoint') private readonly nlpEndpointModel: Model<NlpEndpoint>,
        @InjectModel('NlpConfig') private readonly nlpConfigModel: Model<NlpConfig>
    ) {}

    async serviceRequest(userID: string,
                        input: string, 
                        serviceID: string, 
                        config: string, 
                        options: Record<string, string>) {
        const endpointID = await this.parseConfig(serviceID, config);
        const endpoint = (await this.nlpEndpointModel.findById(endpointID).exec()).toObject();
        const method = endpoint.method;
        const url = endpoint.url;
        
        const payload = {
            message: input,
            options: options
        };
        
        let response;
        
        if (method === 'POST') {
            response = await axios.post(url, payload);
        } else if (method === 'GET') {
            response = await axios.get(url, { params: payload });
        } else {
            throw new HttpException("Invalid Request (Invalid HTTP Method)", HttpStatus.BAD_REQUEST)
        }
        const query = new this.queryModel({
            userID: userID,
            serviceID: serviceID,
            input: input,
            output: JSON.stringify(response.data),
            endpointID: endpointID,
            options: options
        })
        await query.save();

        return response.data;
    }

    // retrieves the configs of an NLP API
    async retrieveConfig(serviceID: string) {
        const api = await this.nlpModel.findById(serviceID);
        if (!api) {
            return false;
        }

        const configs = await this.nlpConfigModel.find({ serviceID: api.id })
        
        var configData = []

        for (const config of configs) {
            const options = (await this.nlpEndpointModel.findById(config.endpointID).exec())
                                .toJSON().options
            configData.push({
                task: config.task,
                options: options
            })
        }

        return configData;
    }

    // maps the configuration to the associated endpoint
    private async parseConfig(serviceID: string, configTask: string) {
        const api = await this.nlpModel.findById(serviceID);
        if (!api) {
            return false;
        }

        const config = await this.nlpConfigModel.findOne({ serviceID: api.id, task: configTask })
        if (!config) {
            return false
        }
        return config.endpointID;
    }
}