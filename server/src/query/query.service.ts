import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Query } from "./query.model";
import { Model } from "mongoose";
import axios from 'axios';
import { Nlp, NlpEndpoint, NlpEndpointModel, NlpModel } from "src/nlp/nlp.model";

@Injectable() 
export class QueryService {
    constructor(
        @InjectModel('Query') private readonly queryModel: Model<Query>,
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>,
        @InjectModel('NlpEndpoint') private readonly nlpEndpointModel: Model<NlpEndpoint>
    ) {}

    async serviceRequest(userID: string,
                        input: string, 
                        serviceID: string, 
                        config: string, 
                        options: Record<string, string>) {
        const endpointID = await this.parseConfig(serviceID, config);
        const endpoint = (await this.nlpEndpointModel.findById(endpointID).exec()).toObject();
        const method = endpoint.method;
        const url = endpoint.endpoint;
        
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

    // retrieves the options of an NLP API
    async retrieveConfig(serviceID: string) {
        
    }

    // maps the configuration to the associated endpoint
    private async parseConfig(serviceID: string, configTask: string) {
        
    }
}