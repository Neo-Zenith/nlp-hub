import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Service, ServiceEndpoint, ServiceType } from './services.model'
import { isNullOrUndefined } from '@typegoose/typegoose/lib/internal/utils'

@Injectable()
export class ServiceService {
    constructor(
        @InjectModel('Service') private readonly serviceModel: Model<Service>,
        @InjectModel('ServiceEndpoint')
        private readonly serviceEndpointModel: Model<ServiceEndpoint>,
    ) {}

    async createService(
        name: string,
        description: string,
        address: string,
        type: string,
        endpoints: Record<string, any>[],
    ): Promise<void> {
        const newService = new this.serviceModel({
            name,
            description,
            baseAddress: address,
            type,
        })

        for (let i = 0; i < endpoints.length; i++) {
            let newEndpoint: ServiceEndpoint
            newEndpoint = new this.serviceEndpointModel({
                serviceID: newService.id,
                method: endpoints[i].method,
                options:
                    isNullOrUndefined(endpoints[i].textBased) || endpoints[i].textBased
                        ? endpoints[i].options
                        : undefined,
                endpointPath: endpoints[i].endpointPath,
                task: endpoints[i].task,
                textBased: isNullOrUndefined(endpoints[i].textBased)
                    ? true
                    : endpoints[i].textBased,
                supportedFormats:
                    isNullOrUndefined(endpoints[i].textBased) || endpoints[i].textBased
                        ? undefined
                        : endpoints[i].supportedFormats,
            })

            await this.saveEndpointDB(newEndpoint)
        }
        await this.saveServiceDB(newService)
    }

    async removeService(type: string, version: string): Promise<void> {
        const service = await this.getService(type, version)
        await this.serviceModel.deleteOne({ _id: service.id })
    }

    async updateService(
        service: Service,
        name?: string,
        version?: string,
        baseAddress?: string,
        description?: string,
        type?: string,
    ): Promise<void> {
        let updates = {
            ...(version && { version }),
            ...(type && { type }),
            ...(name && { name }),
            ...(baseAddress && { baseAddress }),
            ...(description && { description }),
        }

        await this.updateServiceDB(service, updates)
    }

    async getServices(name?: string, type?: string): Promise<Service[]> {
        const query = {
            ...(name && { $text: { $search: name } }),
            ...(type && { type }),
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
        if (!Object.keys(ServiceType).includes(type)) {
            throw new HttpException(
                `Invalid type. Expected any of ${Object.values(ServiceType).join(
                    ', ',
                )}, but received ${type}`,
                HttpStatus.NOT_FOUND,
            )
        }
        const services = await this.getServices(undefined, type)
        let returnVersion = []
        for (const service of services) {
            returnVersion.push(service.version)
        }
        return returnVersion
    }

    async createEndpoint(
        service: Service,
        endpointPath: string,
        method: string,
        task: string,
        options: Record<string, any>,
        textBased: boolean,
        supportedFormats: string[],
    ): Promise<void> {
        const newEndpoint = await new this.serviceEndpointModel({
            serviceID: service.id,
            endpointPath,
            method,
            task,
            options: isNullOrUndefined(textBased) || textBased ? options : undefined,
            textBased,
            supportedFormats:
                isNullOrUndefined(textBased) || textBased ? undefined : supportedFormats,
        })

        await this.saveEndpointDB(newEndpoint)
    }

    async removeEndpoint(service: Service, task: string): Promise<void> {
        const endpoint = await this.getEndpoint(service.id, task)
        await this.serviceEndpointModel.deleteOne({ _id: endpoint.id })
    }

    async updateEndpoint(
        endpoint: ServiceEndpoint,
        newEndpointPath?: string,
        newTask?: string,
        newOptions?: Record<string, any>,
        newMethod?: string,
        newSupportedFormats?: string[],
    ): Promise<void> {
        let updates = {
            ...(newEndpointPath && { endpointPath: newEndpointPath }),
            ...(newTask && { task: newTask }),
            ...(newOptions && { options: newOptions }),
            ...(newMethod && { method: newMethod }),
            ...(newSupportedFormats && { supportedFormats: newSupportedFormats }),
        }
        await this.updateEndpointDB(endpoint, updates)
    }

    async getEndpoints(
        service: Service,
        task?: string,
        method?: string,
    ): Promise<ServiceEndpoint[]> {
        const query = {
            serviceID: service.id,
            ...(task && { task }),
            ...(method && { method }),
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

    private async saveServiceDB(service: Service): Promise<void> {
        try {
            await service.save()
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
    ): Promise<void> {
        try {
            await this.serviceModel.updateOne({ _id: service.id }, { $set: updates })
        } catch (err) {
            if (err.message.includes('duplicate key')) {
                if (err.message.includes('baseAddress')) {
                    const message = 'Invalid address. There is another service of the same address.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
                if (err.message.includes('version')) {
                    const message =
                        'Invalid type and version. There is another service of the same type and version.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
            }
        }
    }

    private async updateEndpointDB(
        endpoint: ServiceEndpoint,
        updates: Record<string, any>,
    ): Promise<void> {
        try {
            await this.serviceEndpointModel.updateOne({ _id: endpoint.id }, { $set: updates })
        } catch (err) {
            if (err.message.includes('duplicate key')) {
                if (err.message.includes('task')) {
                    const message =
                        'Invalid task. There is another endpoint of the same task for the specified service.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
                if (err.message.includes('method')) {
                    const message =
                        'Invalid method. There is another endpoint of the same method for the specified service.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
            }
        }
    }

    private async saveEndpointDB(endpoint: ServiceEndpoint): Promise<void> {
        try {
            await endpoint.save()
        } catch (err) {
            if (err.message.includes('duplicate key')) {
                if (err.message.includes('task')) {
                    const message =
                        'Invalid task. There is another endpoint of the same task for the specified service.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
                if (err.message.includes('method')) {
                    const message =
                        'Invalid method. There is another endpoint of the same method and endpointPath for the specified service.'
                    throw new HttpException(message, HttpStatus.CONFLICT)
                }
            }
        }
    }
}
