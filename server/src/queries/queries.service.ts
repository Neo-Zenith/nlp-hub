import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import axios, { AxiosResponse } from 'axios'

import { Query } from './queries.model'
import { Service, ServiceEndpoint } from '../services/services.model'
import { Admin, User } from '../users/users.model'

@Injectable()
export class QueryService {
    constructor(
        @InjectModel('Query') private readonly queryModel: Model<Query>,
        @InjectModel('Service') private readonly serviceModel: Model<Service>,
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Admin') private readonly adminModel: Model<Admin>,
        @InjectModel('ServiceEndpoint')
        private readonly serviceEndpointModel: Model<ServiceEndpoint>,
    ) {}

    async serviceQuery(
        user: User,
        service: Service,
        endpoint: ServiceEndpoint,
        options: Record<string, any>,
    ): Promise<Record<string, any>> {
        const fullPath = service.baseAddress + endpoint.endpointPath

        let response: AxiosResponse<any, any>
        let elapsedTime: number
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        }

        if (endpoint.method === 'POST') {
            const start = performance.now()
            response = await axios.post(fullPath, options, config)
            const end = performance.now()
            elapsedTime = (end - start) / 1000
        } else if (endpoint.method === 'GET') {
            const params = options
            const start = performance.now()
            response = await axios.get(fullPath, { params })
            const end = performance.now()
            elapsedTime = (end - start) / 1000
        } else if (endpoint.method === 'PUT') {
            const start = performance.now()
            response = await axios.put(fullPath, options, config)
            const end = performance.now()
            elapsedTime = (end - start) / 1000
        } else if (endpoint.method === 'DELETE') {
            const params = options
            const start = performance.now()
            response = await axios.delete(fullPath, { params })
            const end = performance.now()
            elapsedTime = (end - start) / 1000
        }

        const serviceID = service.id
        const endpointID = endpoint.id
        const userID = user.id
        const isAdminQuery = user.role === 'admin' ? true : false
        const query = new this.queryModel({
            userID,
            serviceID,
            endpointID,
            output: JSON.stringify(response.data),
            options,
            executionTime: elapsedTime,
            isAdminQuery,
        })

        await query.save()
        return {
            uuid: query.uuid,
            executionTime: query.executionTime,
            output: response.data,
        }
    }

    async getUsages(
        userID: string,
        role: string,
        type?: string,
        version?: string,
        execTime?: string,
        startDate?: string,
        endDate?: string,
        timezone?: string,
        returnDelUser?: boolean,
        returnDelService?: boolean,
    ): Promise<(Query & Record<string, any>)[]> {
        let usages: Query[]
        let query: any = {}
        let offset: number

        if (execTime) {
            query['executionTime'] = { $lte: +execTime }
        }
        if (timezone) {
            offset = Number.parseFloat(timezone)
        } else {
            offset = 0
        }

        if (startDate) {
            const startDateTime = new Date(startDate)
            startDateTime.setHours(startDateTime.getHours() - Math.floor(offset))
            startDateTime.setMinutes(startDateTime.getMinutes() - (offset % 1) * 60)
            query['dateTime'] = { $gte: startDateTime }
        }
        if (endDate) {
            const endDateTime = new Date(endDate)
            endDateTime.setHours(endDateTime.getHours() - Math.floor(offset))
            endDateTime.setMinutes(endDateTime.getMinutes() - (offset % 1) * 60)
            if (query['dateTime']) {
                query['dateTime'].$lte = endDateTime
            } else {
                query['dateTime'] = { $lte: endDateTime }
            }
        }

        if (role === 'admin') {
            usages = await this.queryModel.find(query).exec()
        } else {
            query['userID'] = userID
            usages = await this.queryModel.find(query).exec()
        }

        const filteredUsages = await Promise.all(
            usages.map(async (usage) => {
                const service = await this.serviceModel.findById(usage.serviceID)
                let user: User
                if (usage.isAdminQuery) {
                    user = await this.adminModel.findById(usage.userID)
                } else {
                    user = await this.userModel.findById(usage.userID)
                }

                let updates = {}
                if (service) {
                    if (!(service.type === type && service.version === version)) {
                        return null
                    }
                } else {
                    if (returnDelService) {
                        updates['serviceDeleted'] = true
                    } else {
                        return null
                    }
                }

                if (!user) {
                    if (returnDelUser) {
                        updates['userDeleted'] = true
                    } else {
                        return null
                    }
                }
                return Object.assign(updates, usage['_doc'])
            }),
        )

        return filteredUsages.filter(Boolean)
    }

    async getUsage(uuid: string): Promise<Query & Record<string, any>> {
        const usage = await this.queryModel.findOne({ uuid })
        if (!usage) {
            const message = 'Usage not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }

        let updates: any = {}
        const service = await this.serviceModel.findById(usage.serviceID)
        if (!service) {
            updates['serviceDeleted'] = true
        }

        const isAdminQuery = usage.isAdminQuery
        let user: User
        if (isAdminQuery) {
            user = await this.adminModel.findById(usage.userID)
        } else {
            user = await this.userModel.findById(usage.userID)
        }
        if (!user) {
            updates['userDeleted'] = true
        }

        return Object.assign(updates, usage['_doc'])
    }

    async deleteUsage(uuid: string): Promise<Record<string, string>> {
        const usage = await this.queryModel.findOne({ uuid: uuid })
        if (!usage) {
            const message = 'Usage not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }
        await this.queryModel.deleteOne({ uuid: uuid })
        return { message: 'Usage deleted.' }
    }

    async retrieveService(type: string, version: string): Promise<Service> {
        const service = await this.serviceModel.findOne({ type: type, version: version })
        if (!service) {
            const message = 'Service not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }
        return service
    }

    async retrieveEndpoint(serviceID: string, task: string): Promise<ServiceEndpoint> {
        const endpoint = await this.serviceEndpointModel.findOne({
            serviceID: serviceID,
            task: task,
        })
        if (!endpoint) {
            const message = 'Endpoint not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }
        return endpoint
    }

    async retrieveUser(userID: string, role: string): Promise<User> {
        var user: User
        if (role === 'admin') {
            user = await this.adminModel.findById(userID)
        } else {
            user = await this.userModel.findById(userID)
        }
        if (!user) {
            const message = 'User not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }
        return user
    }
}
