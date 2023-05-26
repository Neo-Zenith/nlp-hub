import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Service, ServiceEndpoint, ServiceType } from "./services.model";

@Injectable()
export class ServiceService {
    constructor(
        @InjectModel('Service') private readonly serviceModel: Model<Service>,
        @InjectModel('ServiceEndpoint') private readonly serviceEndpointModel: Model<ServiceEndpoint>
    ) {}

    async addService(
        name: string, description: string, address: string, 
        type: string, endpoints: ServiceEndpoint[]
    ) {
        const newService = new this.serviceModel({
            name, description, baseAddress: address, type
        })
        await this.saveService(newService);
        for (let i = 0; i < endpoints.length; i ++) {
            const newEndpoint = new this.serviceEndpointModel({
                serviceID: newService.id,
                method: endpoints[i].method,
                options: endpoints[i].options,
                endpointPath: endpoints[i].endpointPath,
                task: endpoints[i].task
            });
            await this.saveEndpoint(newEndpoint);
        }
        return { message: 'Service subscribed' }
    }

    async removeService(type: string, version: string) {
        const service = await this.getService(type, version);
        await this.serviceModel.deleteOne({ _id: service.id });
        return { message: "Service unsubscribed" };
    }

    async updateService(
        service: Service, name?: string, version?: string, 
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

        await this.updateServiceDB(service, updates);
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
    
        const services = await this.serviceModel.find(query).exec();
        return services;
    }

    async getService(type: string, version: string) {
        const service = await this.serviceModel.findOne({ type, version });
        if (! service) {
            throw new HttpException("Service not found", HttpStatus.NOT_FOUND);
        }
        return service;
    }

    getServiceTypes() {
        const types = Object.values(ServiceType);
        return types;
    }

    async getServiceVersions(type: string) {
        const services = await this.serviceModel.find({ type })
        var returnVersion = []
        for (const service of services) {
            returnVersion.push(service.version)
        }
        return returnVersion;
    }

    async addEndpoint(
        service: Service, endpointPath: string,
        method: string, task: string, options: Record<string, string>
    ) {
        const newEndpoint = await new this.serviceEndpointModel({
            serviceID: service.id, endpointPath, method, task, options
        });
        await this.saveEndpoint(newEndpoint);

        return { message: 'Endpoint added'};
    }

    async removeEndpoint(service: Service, task: string) {
        const endpoint = await this.serviceEndpointModel.findOne({ 
            task, serviceID: service.id 
        });
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND)
        }
        await this.serviceEndpointModel.deleteOne({ _id: endpoint.id });
        return { message: "Endpoint deleted" };
    }

    async updateEndpoint(
        endpoint: ServiceEndpoint, newEndpointPath?: string,
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
        
        await this.updateEndpointDB(endpoint, updates);

        return { message: 'Endpoint updated' }
    }

    async getEndpoints(
        service: Service, task?: string, method?: string
    ) {
        var query: any = {};

        query.serviceID = service.id;
        if (task) {
            query.$text = { $search: task };
        }
        if (method) {
            query.method = method;
        }
        
        const endpoints = await this.serviceEndpointModel.find(query).exec();
        return endpoints;
    }

    async getEndpoint(serviceID: string, task: string) {
        const endpoint = await this.serviceEndpointModel.findOne({ 
            serviceID, task
        });
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND)
        }
        return endpoint;
    }

    private async saveService(service: Service) {
        try {
            await service.save();
            return;
        } catch (err) {
            if (err.message.includes('duplicate key')) {
                if (err.message.includes('baseAddress')) {
                    throw new HttpException(
                        "Service with the same base address already registered", 
                        HttpStatus.CONFLICT
                    )
                }
            }
        }
    }

    private async updateServiceDB(service: Service, updates: Record<string, any>) {
        try {
            await this.serviceModel.updateOne(
                { _id: service.id }, 
                { $set: updates }
            )
        } catch (err) {
            if (err.message.includes("duplicate key")) {
                if (err.message.includes("baseAddress")) {
                    throw new HttpException(
                        "Service with the same base address already registered", 
                        HttpStatus.CONFLICT
                    )
                } 
                if (err.message.includes("version")) {
                    throw new HttpException(
                        "Service with the same type and version already registered",
                        HttpStatus.CONFLICT
                    )
                }
            }
        }
    }

    private async updateEndpointDB(endpoint: ServiceEndpoint, updates: Record<string, any>) {
        try {
            await this.serviceEndpointModel.updateOne(
                { _id: endpoint.id }, 
                { $set: updates }
            )
        } catch (err) {
            if (err.message.includes("duplicate key")) {
                if (err.message.includes("task")) {
                    throw new HttpException(
                        "Task already exist for the service", HttpStatus.CONFLICT
                );
                } 
                if (err.message.includes("method")) {
                    throw new HttpException(
                        "Endpoint of the given method already registered",
                        HttpStatus.CONFLICT
                    )
                }
            }
        }
    }   

    private async saveEndpoint(endpoint: ServiceEndpoint) {
        try {
            await endpoint.save()
        } catch (err) {
            if (err.message.includes("duplicate key")) {
                if (err.message.includes("task")) {
                    throw new HttpException(
                        "Task already exist for the service", HttpStatus.CONFLICT
                    );
                }
                if (err.message.includes("method")) {
                    throw new HttpException(
                        "Endpoint of the given method already registered",
                        HttpStatus.CONFLICT
                    )
                }
            }
        }
    }
}
