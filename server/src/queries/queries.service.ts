import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import axios from 'axios'
import * as fs from 'fs-extra'
import * as FormData from 'form-data'

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
    ) {}

    async handleTextQuery(
        user: User | Admin,
        service: Service,
        endpoint: ServiceEndpoint,
        options: Record<string, any>,
    ): Promise<Record<string, any>> {
        const fullPath = service.baseAddress + endpoint.endpointPath
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        }

        const { method } = endpoint
        const params = method === 'GET' || method === 'DELETE' ? options : undefined

        const start = performance.now()
        const response = await axios.request({
            method,
            url: fullPath,
            data: method === 'POST' || method === 'PUT' ? options : undefined,
            params,
            headers: config.headers,
        })
        const end = performance.now()
        const elapsedTime = (end - start) / 1000

        const { data } = response
        const serviceID = service.id
        const endpointID = endpoint.id
        const userID = user.id
        const isAdminQuery = user.role === 'admin'
        const sanitizedData = this.sanitizeResponse(data)

        const query = new this.queryModel({
            userID,
            serviceID,
            type: service.type,
            version: service.version,
            endpointID,
            /**
             * * response status code
             */
            output: JSON.stringify(sanitizedData),
            options,
            executionTime: elapsedTime,
            isAdminQuery,
        })

        await this.saveQueryDB(query)

        return {
            uuid: query.uuid,
            executionTime: query.executionTime,
            output: sanitizedData,
        }
    }

    async handleUploadableQuery(
        user: User | Admin,
        service: Service,
        endpoint: ServiceEndpoint,
        uploadable: Express.Multer.File,
    ) {
        const fullPath = service.baseAddress + endpoint.endpointPath

        const form = new FormData()
        form.append('file', fs.createReadStream(uploadable.path), uploadable.filename)

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: form,
        }

        const start = performance.now()
        const response = await axios.post(fullPath, form, config)
        const end = performance.now()
        const elapsedTime = (end - start) / 1000

        await this.removeFile(uploadable)

        const { data } = response
        const serviceID = service.id
        const endpointID = endpoint.id
        const userID = user.id
        const isAdminQuery = user.role === 'admin'
        const sanitizedData = this.sanitizeResponse(data)

        const query = new this.queryModel({
            userID,
            serviceID,
            type: service.type,
            version: service.version,
            endpointID,
            output: JSON.stringify(sanitizedData),
            executionTime: elapsedTime,
            isAdminQuery,
        })

        await this.saveQueryDB(query)

        return {
            uuid: query.uuid,
            executionTime: query.executionTime,
            output: sanitizedData,
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
    ): Promise<Record<string, any>[]> {
        let query: any = {}
        // parse execTime into number
        if (execTime) {
            query.executionTime = { $lte: Number.parseFloat(execTime) }
        }

        // convert range of datetime into UTC
        if (startDate) {
            let startDateTime = new Date(startDate)
            startDateTime = this.convertTimeToUTC(startDateTime, timezone)
            query.dateTime = { $gte: startDateTime }
        }

        if (endDate) {
            let endDateTime = new Date(endDate)
            endDateTime = this.convertTimeToUTC(endDateTime, timezone)
            if (query.dateTime) {
                query.dateTime.$lte = endDateTime
            } else {
                query.dateTime = { $lte: endDateTime }
            }
        }

        // users can only retrieve queries made by themselves
        if (role !== 'admin') {
            query.userID = userID
        }

        const usages = await this.queryModel.find(query).exec()
        const filteredUsages = await Promise.all(
            usages.map(async (usage) => {
                const service = await this.serviceModel.findById(usage.serviceID)
                let user: User | Admin

                if (usage.isAdminQuery) {
                    user = await this.adminModel.findById(usage.userID)
                } else {
                    user = await this.userModel.findById(usage.userID)
                }

                // service found, check if type and version match
                if (service) {
                    if (type && service.type !== type) {
                        return null
                    }
                    if (version && service.version !== version) {
                        return null
                    }
                } else if (!returnDelService) {
                    return null // service not found, and user did not indicate to return deleted services
                }

                // user not found, and user did not indicate to return deleted user
                if (!user && !returnDelUser) {
                    return null
                }

                return { ...usage.toObject(), serviceDeleted: !service, userDeleted: !user }
            }),
        )

        return filteredUsages.filter(Boolean)
    }

    async getUsage(uuid: string): Promise<Record<string, any>> {
        let update: any = {}

        // validate if usage exists
        const usage = await this.queryModel.findOne({ uuid })
        if (!usage) {
            const message = 'Usage not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }

        // check if service exists
        const service = await this.serviceModel.findById(usage.serviceID)
        if (!service) {
            update.serviceDeleted = true
        }

        // check if user exists
        const isAdminQuery = usage.isAdminQuery
        let user: User
        if (isAdminQuery) {
            user = await this.adminModel.findById(usage.userID)
        } else {
            user = await this.userModel.findById(usage.userID)
        }
        if (!user) {
            update.userDeleted = true
        }

        return Object.assign(update, usage['_doc'])
    }

    async deleteUsage(uuid: string): Promise<void> {
        // check if usage exists
        await this.getUsage(uuid)
        // deletes the usage
        await this.queryModel.deleteOne({ uuid: uuid })
    }

    convertTimeToUTC(dateTime: Date, timezone?: string) {
        const offset = timezone ? Number.parseFloat(timezone) : 0
        dateTime.setUTCHours(dateTime.getUTCHours() - Math.trunc(offset))
        dateTime.setUTCMinutes(dateTime.getUTCMinutes() - Number((offset % 1).toFixed(1)) * 60)
        return dateTime
    }

    convertUTCToLocal(dateTime: Date, timezone?: string) {
        const offset = timezone ? Number.parseFloat(timezone) : 0
        dateTime.setUTCHours(dateTime.getUTCHours() + Math.trunc(offset))
        dateTime.setUTCMinutes(dateTime.getUTCMinutes() + Number((offset % 1).toFixed(1)) * 60)
        return dateTime
    }

    private async removeFile(file: Express.Multer.File) {
        await fs.unlink(file.path)
    }

    private sanitizeResponse(data: any) {
        if (typeof data === 'string' && data.startsWith('<!DOCTYPE html>')) {
            return { output: 'Action completed successfully' }
        }
        return data
    }

    private async saveQueryDB(query: Query) {
        await query.save()
    }
}
