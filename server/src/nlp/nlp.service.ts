import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Nlp, NlpEndpoint } from "./nlp.model";

@Injectable()
export class NlpService {
    constructor(
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>,
        @InjectModel('NlpEndpoint') private readonly nlpEndpointModel: Model<NlpEndpoint>
    ) {}

    async subscribe(
        serviceName: string, 
        serviceVersion: string, 
        serviceDescription: string, 
        serviceAddress: string,
        serviceType: string,
        serviceEndpoints: NlpEndpoint[]) {

        const newService = new this.nlpModel({
            name: serviceName,
            version: serviceVersion,
            description: serviceDescription,
            baseAddress: serviceAddress,
            type: serviceType
        });
        const service = await newService.save();

        for (let i = 0; i < serviceEndpoints.length; i ++) {
            const newEndpoint = new this.nlpEndpointModel({
                serviceID: service.id,
                method: serviceEndpoints[i].method,
                options: serviceEndpoints[i].options,
                endpointPath: serviceEndpoints[i].endpointPath,
                task: serviceEndpoints[i].task
            });
            await newEndpoint.save();
        }
        return service.id;
    }

    async unsubscribe(serviceID: string) {
        const service = await this.checkServiceExist(serviceID);
        await this.nlpModel.deleteOne({_id: service.id});
        return {
            message: "Service deleted"
        };
    }

    async retrieveAllServices() {
        const services = await this.nlpModel.find().exec();
        return services;
    }

    async retrieveOneService(serviceID: string) {
        const service = await this.checkServiceExist(serviceID);
        return service;
    }

    async retrieveAllEndpoints() {
        const endpoints = await this.nlpEndpointModel.find().exec();
        return endpoints;
    }

    async retrieveOneEndpoint(endpointID: string) {
        const endpoint = await this.nlpEndpointModel.findById(endpointID);
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND);
        }
        return endpoint;
    }

    async retrieveEndpointsForOneService(serviceID: string) {
        const endpoints = await this.nlpEndpointModel.find({ serviceID: serviceID }).exec();
        if (endpoints.length === 0) {
            throw new HttpException(
                "No endpoints found for requested service", HttpStatus.NOT_FOUND)
        }
        return endpoints;
    }

    private async checkServiceExist(serviceID: string) {
        const service = await this.nlpModel.findById(serviceID);;
        const endpoints = await this.nlpEndpointModel.find({serviceID: serviceID});

        if (! service) {
            throw new HttpException("Service not found", HttpStatus.NOT_FOUND);
        }

        // A service without any endpoint is invalid
        if (endpoints.length === 0) {
            throw new HttpException(
                "No endpoints found for requested service", HttpStatus.NOT_FOUND)
        }
        return service;
    }
}
