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

    async retrieveAllServices(name?: string, type?: string) {
        const query: any = {};
    
        if (name) {
            query.$text = { $search: name };
        }
    
        if (type) {
            query.type = type;
        }
    
        const services = await this.nlpModel.find(query).exec();
        return services;
    }

    async retrieveOneService(serviceID: string) {
        const service = await this.checkServiceExist(serviceID);
        return service;
    }

    async retrieveAllEndpoints(task?: string, method?: string) {
        const query: any = {};
    
        if (task) {
            query.$text = { $search: task };
        }
    
        if (method) {
            query.method = method;
        }
    
        const endpoints = await this.nlpEndpointModel.find(query).exec();
        return endpoints;
    }

    async retrieveOneEndpoint(endpointID: string) {
        const endpoint = await this.nlpEndpointModel.findById(endpointID);
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND);
        }
        return endpoint;
    }

    async retrieveEndpointsForOneService(serviceID: string, task?: string, method?: string) {
        const query: any = {};
        if (task) {
            query.$text = { $search: task };
        }
        if (method) {
            query.method = method;
        }
        query.serviceID = serviceID;
    
        const endpoints = await this.nlpEndpointModel.find(query).exec();
    
        if (endpoints.length === 0) {
            throw new HttpException(
                'No endpoints found for the requested service',
                HttpStatus.NOT_FOUND
            );
        }
    
        return endpoints;
    }

    async addEndpoint(
        serviceID: string, 
        endpointPath: string,
        method: string, 
        task: string,
        options: Record<string, string>) {
            const newEndpoint = await new this.nlpEndpointModel({
                serviceID,
                endpointPath,
                method,
                task,
                options
            })
            await newEndpoint.save()

            return newEndpoint.id;
    }

    async removeEndpoint(endpointID: string) {
        console.log(endpointID)
        const endpoint = await this.nlpEndpointModel.findById(endpointID);
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND)
        }
        await this.nlpEndpointModel.deleteOne({_id: endpointID});
        return {
            message: "Endpoint deleted"
        };
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
