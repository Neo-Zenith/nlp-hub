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

    async retrieveAllServices(name?: string, version?: string, type?: string) {
        const query = this.nlpModel.find();
      
        if (name) {
          query.where('name').equals(name);
        }

        if (version) {
          query.where('version').equals(version);
        }

        if (type) {
          query.where('type').equals(type);
        }
      
        const services = await query.exec();
        return services;
    }

    async retrieveOneService(serviceID: string) {
        const service = await this.checkServiceExist(serviceID);
        return service;
    }

    async retrieveAllEndpoints(task?: string, method?: string) {
        const query = this.nlpEndpointModel.find();
      
        if (task) {
            query.where('task').equals(task);
        }

        if (method) {
            query.where('method').equals(method);
        }

        const endpoints = await query.exec();
        return endpoints;
    }

    async retrieveOneEndpoint(endpointID: string) {
        const endpoint = await this.nlpEndpointModel.findById(endpointID);
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND);
        }
        return endpoint;
    }

    async retrieveEndpointsForOneService(serviceID: string, task?: string) {
        const query = this.nlpEndpointModel.find();
      
        if (task) {
          query.where('task').equals(task);
        }
        query.where('serviceID').equals(serviceID);
        const endpoints = await query.exec();

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
