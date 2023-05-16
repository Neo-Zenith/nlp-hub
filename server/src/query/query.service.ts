import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Query } from "./query.model";
import { Model } from "mongoose";
import { NlpModel } from "src/nlp/nlp.model";
import { Response } from "express";

@Injectable() 
export class QueryService {
    constructor(
        @InjectModel('Query') private readonly queryModel: Model<Query>
    ) {}
    
    serviceRequest(input: string, serviceID: string, options: Record<string, string>) {
        
    }

    /**
     * Subroutine to retrieve the API to be used
     * @param serviceID ID of the API to be used
     * @returns Boolean {@linkcode false} for invalid ID; Array[string] => Array[endpoints] otherwise
     */
    private async retrieveEndpoints(serviceID: string) {
        const api = await NlpModel.findById(serviceID);

        if (! api) {
            return false;
        }
        return api.endpoints;
    }

    /**
     * Subroutine to parse the endpoints
     * @param endpoint Endpoint to be parsed
     * @returns Dictionary {method: string, url: string}
     */
    private parseEndpoint(endpoint: string) {
        const [method, url] = endpoint.split(' ');
      
        return {
          method: method.replace('[', '').replace(']', ''),
          url: url.trim(),
        };
    }

    private parseResponse(res: Response) {

    }
}