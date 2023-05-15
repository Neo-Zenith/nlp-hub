import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Query } from "./query.model";
import { Model } from "mongoose";
import { NlpModel } from "src/nlp/nlp.model";

@Injectable() 
export class QueryService {
    constructor(
        @InjectModel('Query') private readonly queryModel: Model<Query>
    ) {}

    serviceRequest(input: string, serviceID: string, options: Record<string, string>) {
        
    }

    private async retrieveEndpoints(serviceID: string) {
        const api = await NlpModel.findById(serviceID);

        if (! api) {
            return false;
        }
        return api.endpoints;
    }

    private parseEndpoint(endpoint: string) {
        const [method, url] = endpoint.split(' ');
      
        return {
          method: method.replace('[', '').replace(']', ''),
          url: url.trim(),
        };
    }
}