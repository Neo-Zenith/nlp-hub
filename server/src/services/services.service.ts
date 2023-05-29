import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Service, ServiceEndpoint, ServiceType } from './services.model'

@Injectable()
export class ServiceService {
    constructor(
        @InjectModel('Service') private readonly serviceModel: Model<Service>,
        @InjectModel('ServiceEndpoint')
        private readonly serviceEndpointModel: Model<ServiceEndpoint>,
    ) {}

    async addService(
        name: string,
        description: string,
        address: string,
        type: string,
        endpoints: Record<string, any>[],
    ): Promise<Record<string, string>> {
        const newService = new this.serviceModel({
            name,
            description,
            baseAddress: address,
            type,
        })

        for (let i = 0; i < endpoints.length; i++) {
            const newEndpoint = new this.serviceEndpointModel({
                serviceID: newService.id,
                method: endpoints[i].method,
                options: endpoints[i].options,
                endpointPath: endpoints[i].endpointPath,
                task: endpoints[i].task,
            })
            await this.saveEndpoint(newEndpoint)
        }
        const message = await this.saveService(newService)
        return message
    }

    async removeService(type: string, version: string): Promise<Record<string, string>> {
        const service = await this.getService(type, version)
        await this.serviceModel.deleteOne({ _id: service.id })
        return { message: 'Service unsubscribed.' }
    }

    async updateService(
        service: Service,
        name?: string,
        version?: string,
        baseAddress?: string,
        description?: string,
        type?: string,
    ): Promise<Record<string, string>> {
        let updates = {}

        if (version) {
            updates['version'] = version
        } else {
            updates['version'] = service.version
        }
        if (type) {
            updates['type'] = type
        } else {
            updates['type'] = service.type
        }
        if (name) {
            updates['name'] = name
        }
        if (baseAddress) {
            updates['baseAddress'] = baseAddress
        }
        if (description) {
            updates['description'] = description
        }

        const message = await this.updateServiceDB(service, updates)
        return message
    }

    async getServices(name?: string, type?: string): Promise<Service[]> {
        let query: any = {}

        if (name) {
            query.$text = { $search: name }
        }
        if (type) {
            query.type = type
        }

        const services = await this.serviceModel.find(query).exec()
        return services
    }

    async getService(type: string, version: string): Promise<Service> {
        const service = await this.serviceModel.findOne({ type, version })
        if (!service) {
            const message = 'Service not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }
        return service
    }

    getServiceTypes(): string[] {
        const types = Object.values(ServiceType)
        return types
    }

    async getServiceVersions(type: string): Promise<string[]> {
        const services = await this.serviceModel.find({ type })
        let returnVersion = []
        for (const service of services) {
            returnVersion.push(service.version)
        }
        return returnVersion
    }

    async addEndpoint(
        service: Service,
        endpointPath: string,
        method: string,
        task: string,
        options: Record<string, string>,
    ): Promise<Record<string, string>> {
        const newEndpoint = await new this.serviceEndpointModel({
            serviceID: service.id,
            endpointPath,
            method,
            task,
            options,
        })
        const message = await this.saveEndpoint(newEndpoint)
        return message
    }

    async removeEndpoint(service: Service, task: string): Promise<Record<string, string>> {
        const endpoint = await this.serviceEndpointModel.findOne({
            task,
            serviceID: service.id,
        })
        if (!endpoint) {
            const message = 'Endpoint not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }
        await this.serviceEndpointModel.deleteOne({ _id: endpoint.id })
        return { message: 'Endpoint deleted' }
    }

    async updateEndpoint(
        endpoint: ServiceEndpoint,
        newEndpointPath?: string,
        newTask?: string,
        newOptions?: Record<string, any>,
        newMethod?: string,
    ): Promise<Record<string, string>> {
        let updates = {}
        if (newEndpointPath) {
            updates['endpointPath'] = newEndpointPath
        }
        if (newTask) {
            updates['task'] = newTask
        }
        if (newOptions) {
            updates['options'] = newOptions
        }
        if (newMethod) {
            updates['method'] = newMethod
        }

        const message = await this.updateEndpointDB(endpoint, updates)
        return message
    }

    async getEndpoints(
        service: Service,
        task?: string,
        method?: string,
    ): Promise<ServiceEndpoint[]> {
        let query: any = {}

        query.serviceID = service.id
        if (task) {
            query.$text = { $search: task }
        }
        if (method) {
            query.method = method
        }

        const endpoints = await this.serviceEndpointModel.find(query).exec()
        return endpoints
    }

    async getEndpoint(serviceID: string, task: string): Promise<ServiceEndpoint> {
        const endpoint = await this.serviceEndpointModel.findOne({
            serviceID,
            task,
        })
        if (!endpoint) {
            const message = 'Endpoint not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }
        return endpoint
    }

    private async saveService(service: Service): Promise<Record<string, string>> {
        try {
            await service.save()
            return { message: 'Service registered.' }
        } catch (err) {
            if (err.message.includes('duplicate key')) {
                if (err.message.includes('baseAddress')) {
                    const message = 'Invalid address. There is another service of the same address.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
            }
        }
    }

    private async updateServiceDB(
        service: Service,
        updates: Record<string, any>,
    ): Promise<Record<string, string>> {
        try {
            await this.serviceModel.updateOne({ _id: service.id }, { $set: updates })
            return { message: 'Service updated.' }
        } catch (err) {
            if (err.message.includes('duplicate key')) {
                if (err.message.includes('baseAddress')) {
                    const message = 'Invalid address. There is another service of the same address.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
                if (err.message.includes('version')) {
                    const message = 'Invalid type and version. There is another service of the same type and version.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
            }
        }
    }

    private async updateEndpointDB(
        endpoint: ServiceEndpoint,
        updates: Record<string, any>,
    ): Promise<Record<string, string>> {
        try {
            await this.serviceEndpointModel.updateOne({ _id: endpoint.id }, { $set: updates })
            return { message: 'Endpoint updated.' }
        } catch (err) {
            if (err.message.includes('duplicate key')) {
                if (err.message.includes('task')) {
                    const message = 'Invalid task. There is another endpoint of the same task for the specified service.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
                if (err.message.includes('method')) {
                    const message = 'Invalid method. There is another endpoint of the same method for the specified service.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
            }
        }
    }

    private async saveEndpoint(endpoint: ServiceEndpoint): Promise<Record<string, string>> {
        try {
            await endpoint.save()
            return { message: 'Endpoint registered.' }
        } catch (err) {
            if (err.message.includes('duplicate key')) {
                if (err.message.includes('task')) {
                    const message = 'Invalid task. There is another endpoint of the same task for the specified service.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
                if (err.message.includes('method')) {
                    const message = 'Invalid method. There is another endpoint of the same method and endpointPath for the specified service.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
            }
        }
    }
}
