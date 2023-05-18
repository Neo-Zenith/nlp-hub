import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Nlp, NlpEndpoint } from "./nlp.model";
import { Debug } from "src/custom/debug/debug";

@Injectable()
export class NlpService {
    constructor(
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>,
        @InjectModel('NlpEndpoint') private readonly nlpEndpointModel: Model<NlpEndpoint>
    ) {}

    // Subscribes a service to the server
    async subscribe(
        serviceName: string, 
        serviceVersion: string, 
        serviceDescription: string, 
        serviceAddress: string,
        serviceEndpoints: NlpEndpoint[]) {

        const newService = new this.nlpModel({
            name: serviceName,
            version: serviceVersion,
            description: serviceDescription,
            address: serviceAddress
        });
        const service = await newService.save();

        for (let i = 0; i < serviceEndpoints.length; i ++) {
            const newEndpoint = new this.nlpEndpointModel({
                serviceID: service.id,
                method: serviceEndpoints[i].method,
                options: serviceEndpoints[i].options,
                endpoint: serviceEndpoints[i].endpoint,
                task: serviceEndpoints[i].task
            });
            await newEndpoint.save();
        }
        return service.id;
    }

    // Removes a service from the server
    async unsubscribe(serviceID: string) {
        const service = await this.checkServiceExist(serviceID);
        await this.nlpModel.deleteOne({_id: service.id});
        return {
            message: "Service deleted"
        };
    }

    // Retrieves all services from the server
    async retrieveAllServices() {
        const services = await this.nlpModel.find().exec();
        return services;
    }

    // Retrieves a specific service from the server
    async retrieveOneService(serviceID: string) {
        const service = await this.checkServiceExist(serviceID);
        return service;
    }

    // Retrieves all endpoints from the server
    async retrieveAllEndpoints() {
        const endpoints = await this.nlpEndpointModel.find().exec();
        return endpoints;
    }

    // Retrieves a specific endpoint 
    async retrieveOneEndpoint(endpointID: string) {
        const endpoint = await this.nlpEndpointModel.findById(endpointID);
        if (! endpoint) {
            throw new HttpException("Endpoint Not Found (Invalid ID)", HttpStatus.NOT_FOUND);
        }
        return endpoint;
    }

    // Retrieves endpoints of a specific service
    async retrieveEndpointsForOneService(serviceID: string) {
        const endpoints = await this.nlpEndpointModel.find({ serviceID: serviceID }).exec();
        if (endpoints.length === 0) {
            throw new HttpException("Endpoints Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
        }
        return endpoints;
    }

    // Check if service exists before performing modification to DB
    private async checkServiceExist(serviceID: string) {
        const service = await this.nlpModel.findById(serviceID);;
        const endpoints = await this.nlpEndpointModel.find({serviceID: serviceID});

        // A service without any endpoint is invalid
        if (! service || endpoints.length === 0) {
            throw new HttpException("Service Not Found (Invalid ID", HttpStatus.NOT_FOUND);
        }
        return service;
    }
}
