import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Nlp } from "./nlp.model";

@Injectable()
export class NlpService {
    constructor(
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>
    ) {}

    // register API
    subscribe(apiName: string, apiVersion: string, apiEndpoints: string[]) {}

    // unregister API
    unsubscribe(apiID: string) {}

    // get all APIs currently registered
    retrieveAll() {}

    // get specific API
    retrieveOne(apiID: string) {
        
    }
}
