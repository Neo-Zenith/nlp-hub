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
        @InjectModel('ServiceEndpoint')
        private readonly serviceEndpointModel: Model<ServiceEndpoint>,
    ) {}

    /**
     * * Queries the {@link ServiceEndpoint} of the {@link Service} specified using text-based options.
     * @param user The {@link User} or {@link Admin} initiating the query.
     * @param service The {@link Service} for which the query is being made.
     * @param endpoint The specific {@link ServiceEndpoint} of the {@link Service} being queried.
     * @param options The text-based options for the query.
     * @summary
     * * Expects `options` to be matched in terms of the fields present and the value type with the pre-defined options schema in the specified {@link ServiceEndpoint}.
     * * Returns the unprocessed response from the service.
     * * `executionTime` is measured in seconds.
     */
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

        const query = new this.queryModel({
            userID,
            serviceID,
            endpointID,
            output: JSON.stringify(data),
            options,
            executionTime: elapsedTime,
            isAdminQuery,
        })

        await query.save()

        return {
            uuid: query.uuid,
            executionTime: query.executionTime,
            output: data,
        }
    }

    /**
     * * Queries the {@link ServiceEndpoint} of the {@link Service} specified using `multipart/form-data` content type for uploadable files.
     * @param user The {@link User} or {@link Admin} initiating the query.
     * @param service The {@link Service} for which the query is being made.
     * @param endpoint The specific {@link ServiceEndpoint} of the {@link Service} being queried.
     * @param uploadable The uploadable image file for the query.
     * @summary
     * * Expects `uploadable` to be accessible from the temporary storage.
     * * Returns the unprocessed response from the service.
     * * `executionTime` is measured in seconds.
     */
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

        const query = new this.queryModel({
            userID,
            serviceID,
            endpointID,
            output: JSON.stringify(data),
            executionTime: elapsedTime,
            isAdminQuery,
        })

        await query.save()

        return {
            uuid: query.uuid,
            executionTime: query.executionTime,
            output: data,
        }
    }

    /**
     * * Returns a {@link Promise} array of objects each extending a {@link Query} document with attributes matching the filters provided, if any.
     * @param userID `ObjectId` of a {@link User} or {@link Admin} document.
     * @param role Role of the {@link User} making the request. Can be either 'user' or 'admin'
     * @param type Type of a service. Each service type may contain multiple {@link Service}.
     * @param version Identifies a service under a specific `type`. `type` and `version` together uniquely identifies a {@link Service}.
     * @param execTime Specifies the maximum acceptable execution time, in seconds, for the returned {@link Query} documents.
     * @param startDate Specifies the start date and time for filtering the query documents. It should be in the format **YYYY-MM-DD** or **YYYY-MM-DDTHH:MM:SS**. If no time is provided, the start date is assumed to begin at 12:00 AM.
     * @param endDate Specifies the end date and time for filtering the query documents. It should be in the format **YYYY-MM-DD** or **YYYY-MM-DDTHH:MM:SS**. If no time is provided, the end date is assumed to end at 11:59 PM.
     * @param timezone Specifies the timezone for interpreting the provided start and end dates. It should be represented as an integer indicating the timezone offset from Coordinated Universal Time (UTC). Use a negative integer for timezones behind UTC.
     * @param returnDelUser Determines whether to include {@link Query} made by deleted users in the returned results.
     * @param returnDelService Determines whether to include {@link Query} made on deleted services in the returned results.
     * @example
     *  getUsages('user001', 'user', 'SUD', 'v1', '2', '2022-12-01', '2023-01-15', '8', true, true)
     *  getUsages('user002', 'user', 'NER', 'v3', '8', '2023-06-01T09:30:00', '2023-06-05T18:45:00', '2', true, true)
     *  getUsages('admin001', 'admin', undefined, undefined, '2', undefined, undefined, undefined, undefined, false)
     * @summary
     * * Expects `userID` to be cast-able to `ObjectId`.
     * * Expects `role` to be either '*user*' or '*admin*'. Any other value will exhibit similar behaviour as '*user*'.
     * * Expects a string literal `execTime` that is cast-able to `Number`.
     * * Expects `startDate` and `endDate` to be cast-able to `Date`.
     * * Expects a string literal `timezone` to be cast-able to `Number`.
     * * `timezone` is ignored if neither `startDate` nor `endDate` is provided.
     * * `returnDelUser` is ignored if user has the role `user` since users are only able to retrieve queries made by themselves.
     */
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

        // default timezone is UTC+0
        let offset = timezone ? Number.parseFloat(timezone) : 0

        // convert range of datetime into UTC
        if (startDate) {
            const startDateTime = new Date(startDate)
            console.log(startDateTime)
            startDateTime.setHours(startDateTime.getHours() - Math.floor(offset))
            startDateTime.setMinutes(startDateTime.getMinutes() - (offset % 1) * 60)
            query.dateTime = { $gte: startDateTime }
        }

        if (endDate) {
            const endDateTime = new Date(endDate)
            endDateTime.setHours(endDateTime.getHours() - Math.floor(offset))
            endDateTime.setMinutes(endDateTime.getMinutes() - (offset % 1) * 60)

            if (query.dateTime) {
                query.dateTime.$lte = endDateTime
            } else {
                query.dateTime = { $lte: endDateTime }
            }
        }
        console.log(query)
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
                    console.log(version, service.version)
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

        const returnedUsages = filteredUsages.filter(Boolean).map((usage) => ({
            uuid: usage.uuid,
            executionTime: usage.executionTime,
            output: usage.output,
            options: usage.options,
            dateTime: usage.dateTime,
            serviceDeleted: usage.serviceDeleted === true ? usage.serviceDeleted : undefined,
            userDeleted: usage.userDeleted === true ? usage.serviceDeleted : undefined,
        }))

        return returnedUsages
    }

    /**
     * * Returns a {@link Promise} object extending a {@link Query} document with matching `uuid`.
     * @param uuid Unique identifier for a Query document
     * @example
     *  getUsage('uuid1')
     * @summary <br>
     * * Expects a valid `uuid`. If no document matches the `uuid`, a {@link HttpException} is raised.
     * * If matching document references a deleted user, returned object includes a `userDeleted` field.
     * * If matching document references a deleted service, returned object includes a `serviceDeleted` field.
     */
    async getUsage(uuid: string): Promise<Record<string, any>> {
        // validate if usage exists
        const usage = await this.queryModel.findOne({ uuid })
        if (!usage) {
            const message = 'Usage not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }

        // check if service exists
        let serviceDeleted: boolean
        const service = await this.serviceModel.findById(usage.serviceID)
        if (!service) {
            serviceDeleted = true
        }

        // check if user exists
        const isAdminQuery = usage.isAdminQuery
        let user: User
        let userDeleted: boolean
        if (isAdminQuery) {
            user = await this.adminModel.findById(usage.userID)
        } else {
            user = await this.userModel.findById(usage.userID)
        }
        if (!user) {
            userDeleted = true
        }

        // process the returned object
        const returnedUsage = {
            uuid: usage.uuid,
            executionTime: usage.executionTime,
            output: usage.output,
            options: usage.options,
            dateTime: usage.dateTime,
            serviceDeleted: serviceDeleted,
            userDeleted: userDeleted,
        }
        return returnedUsage
    }

    /**
     * * Deletes a {@link Query} document with matching `uuid` from the database.
     * @param uuid Unique identifier for a {@link Query} document
     * @example
     *  deleteUsage('uuid123')
     * @summary
     * * Expects a valid uuid. If no document matches the `uuid`, a {@link HttpException} is raised.
     * * Returns a {@link Promise} object with successful deletion message.
     */
    async deleteUsage(uuid: string): Promise<Record<string, string>> {
        // check if usage exists
        const usage = await this.queryModel.findOne({ uuid: uuid })
        if (!usage) {
            const message = 'Usage not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }
        // deletes the usage
        await this.queryModel.deleteOne({ uuid: uuid })
        return { message: 'Usage deleted.' }
    }

    /**
     * * Returns a {@link Promise} {@link Service} document matching the `type` and `version`.
     * @param type Type of a service. Each service type may contain multiple {@link Service}.
     * @param version Identifies a service under a specific `type`. `type` and `version` together uniquely identifies a {@link Service}.
     * @example
     *  retrieveServiceFromDB('SUD', 'v1')
     * @summary<br>
     * * Expects valid `type` and `version`. If no document matches the `type` and `version`, a {@link HttpException} is thrown.
     */
    async retrieveServiceFromDB(type: string, version: string): Promise<Service> {
        const service = await this.serviceModel.findOne({ type: type, version: version })
        if (!service) {
            const message = 'Service not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }
        return service
    }

    /**
     * * Returns a {@link Promise} {@link ServiceEndpoint} document matching the `serviceID` and `task`.
     * @param serviceID `ObjectId` of a {@link Service} document.
     * @param task Unique name that identifies an endpoint of a {@link Service}.
     * @example
     *  retrieveEndpointFromDB('service0001', 'predict')
     * @summary
     * * Expects a valid `serviceID` and `task`. If no document matches the `serviceID` and `task`, a {@link HttpException} is thrown.
     * * Expects `serviceID` to be cast-able to `ObjectId`.
     * * Expects `task` to be case-sensitive. `task` must be an exact match. For example, '*predict*' and '*Predict*' are not matchable.
     */
    async retrieveEndpointFromDB(serviceID: string, task: string): Promise<ServiceEndpoint> {
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

    async removeFile(file: Express.Multer.File) {
        await fs.unlink(file.path)
    }

    /**
     * * Returns a {@link Promise} {@link User} or {@link Promise} {@link Admin} document matching the `userID`.
     * @param userID `ObjectId` of a {@link User} document.
     * @param role Role of the {@link User} to be queried. Can be either 'user' or 'admin'
     * @example
     *  retrieveUserFromDB('admin0001', 'admin')
     *  retrieveUserFromDB('user0001', 'user')
     * @summary
     * * Expects `userID` to be cast-able to `ObjectId`.
     * * Expects a valid `userID`. If no document matches the `userID`, a {@link HttpException} is thrown.
     * * Expects `role` to be either '*user*' or '*admin*'. Any other value will exhibit similar behaviour as '*user*'.
     * * Queries the {@link Admin} collections for '*admin*' role. Queries the {@link User} collections for '*user*' role.
     */
    async retrieveUserFromDB(userID: string, role: string): Promise<User | Admin> {
        var user: User | Admin
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
