import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Nlp, NlpEndpoint, NlpModel, NlpTypes } from "./nlp.model";

@Injectable()
export class NlpService {
    constructor(
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>,
        @InjectModel('NlpEndpoint') private readonly nlpEndpointModel: Model<NlpEndpoint>
    ) {}

    async addService(
        name: string, description: string, address: string, 
        type: string, endpoints: NlpEndpoint[]
    ) {
        const newService = new this.nlpModel({
            name, description, baseAddress: address, type
        });
        await newService.save();

        for (let i = 0; i < endpoints.length; i ++) {
            const newEndpoint = new this.nlpEndpointModel({
                serviceID: newService.id,
                method: endpoints[i].method,
                options: endpoints[i].options,
                endpointPath: endpoints[i].endpointPath,
                task: endpoints[i].task
            });
            await newEndpoint.save();
        }
        return { message: 'Service subscribed' }
    }

    async removeService(type: string, version: string) {
        const service = await this.getService(type, version);
        await this.nlpModel.deleteOne({ _id: service.id });
        return { message: "Service unsubscribed" };
    }

    async updateService(
        service: Nlp, name?: string, version?: string, 
        baseAddress?: string, description?: string, type?: string
    ) {
        var updates = {}

        if (version) {
            updates['version'] = version;
        } else {
            updates['version'] = service.version;
        }
        if (type) {
            updates['type'] = type;
        } else {
            updates['type'] = service.type;
        }
        if (name) {
            updates['name'] = name;
        }
        if (baseAddress) {
            updates['baseAddress'] = baseAddress;
        }
        if (description) {
            updates['description'] = description;
        }

        await NlpModel.updateOne(
            { _id: service.id }, 
            { $set: updates } 
        );

        return { message: "Service updated" }
    }

    async getServices(name?: string, type?: string) {
        var query: any = {};
    
        if (name) {
            query.$text = { $search: name };
        }
        if (type) {
            query.type = type;
        }
    
        const services = await this.nlpModel.find(query).exec();
        return services;
    }

    async getService(type: string, version: string) {
        const service = await this.nlpModel.findOne({ type, version });
        if (! service) {
            throw new HttpException("Service not found", HttpStatus.NOT_FOUND);
        }
        return service;
    }

    getServiceTypes() {
        const types = Object.values(NlpTypes);
        return types;
    }

    async addEndpoint(
        service: Nlp, endpointPath: string,
        method: string, task: string, options: Record<string, string>
    ) {
        const newEndpoint = await new this.nlpEndpointModel({
            serviceID: service.id, endpointPath, method, task, options
        });
        await newEndpoint.save()

        return { message: 'Endpoint added'};
    }

    async removeEndpoint(service: Nlp, task: string) {
        const endpoint = await this.nlpEndpointModel.findOne({ 
            task, serviceID: service.id 
        });
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND)
        }
        await this.nlpEndpointModel.deleteOne({ _id: endpoint.id });
        return { message: "Endpoint deleted" };
    }

    async updateEndpoint(
        endpoint: NlpEndpoint, newEndpointPath?: string,
        newTask?: string, newOptions?: Record<string, any>, newMethod?: string
    ) {
        var updates = {}
        if (newEndpointPath) {
            updates['endpointPath'] = newEndpointPath;
        }
        if (newTask) {
            updates['task'] = newTask;
        }
        if (newOptions) {
            updates['options'] = newOptions;
        }
        if (newMethod) {
            updates['method'] = newMethod;
        }
        
        await NlpModel.updateOne(
            { _id: endpoint.id }, 
            { $set: updates } 
        );

        return { message: 'Service updated' }
    }

    async getEndpoints(
        service: Nlp, task?: string, method?: string
    ) {
        var query: any = {};

        query.serviceID = service.id;
        if (task) {
            query.$text = { $search: task };
        }
        if (method) {
            query.method = method;
        }
        
        const endpoints = await this.nlpEndpointModel.find(query).exec();
        return endpoints;
    }

    async getEndpoint(serviceID: string, task: string) {
        const endpoint = await this.nlpEndpointModel.findOne({ 
            serviceID, task
        });
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND)
        }
        return endpoint;
    }
}
