import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Connection, Model, connect } from 'mongoose'
import { HttpException, HttpStatus } from '@nestjs/common'

import { Query, QueryModel, QuerySchema } from '../queries.model'
import { QueryController, UsageController } from '../queries.controller'
import { QueryService } from '../queries.service'
import { ServiceController } from '../../services/services.controller'
import { serviceFixture1 } from '../../services/test/fixtures/services.fixture'
import { ServiceService } from '../../services/services.service'
import {
    Service,
    ServiceEndpoint,
    ServiceEndpointSchema,
    ServiceSchema,
} from '../../services/services.model'
import { Admin, AdminSchema, User, UserSchema } from '../../users/users.model'
import { UserController } from '../../users/users.controller'
import { UserService } from '../../users/users.service'
import {
    adminFixture1,
    userFixture1,
    userFixture2,
    userFixture3,
} from '../../users/test/fixtures/users.fixture'
import { mockRequestObject } from '../../common/test/mock/common.model'

describe('QueriesController', () => {
    let mongod: MongoMemoryServer
    let mongoConnection: Connection

    let queryController: QueryController
    let usageController: UsageController

    let queryModel: Model<Query>
    let serviceModel: Model<Service>
    let serviceEndpointModel: Model<ServiceEndpoint>
    let userModel: Model<User>
    let adminModel: Model<Admin>

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        const uri = mongod.getUri()
        mongoConnection = (await connect(uri)).connection

        queryModel = mongoConnection.model(Query.name, QuerySchema)
        serviceModel = mongoConnection.model(Service.name, ServiceSchema)
        serviceEndpointModel = mongoConnection.model(ServiceEndpoint.name, ServiceEndpointSchema)
        userModel = mongoConnection.model(User.name, UserSchema)
        adminModel = mongoConnection.model(Admin.name, AdminSchema)

        const module: TestingModule = await Test.createTestingModule({
            controllers: [QueryController, ServiceController, UsageController, UserController],
            providers: [
                QueryService,
                ServiceService,
                UserService,
                { provide: getModelToken(Query.name), useValue: queryModel },
                { provide: getModelToken(Service.name), useValue: serviceModel },
                { provide: getModelToken(ServiceEndpoint.name), useValue: serviceEndpointModel },
                { provide: getModelToken(User.name), useValue: userModel },
                { provide: getModelToken(Admin.name), useValue: adminModel },
            ],
        }).compile()

        queryController = module.get<QueryController>(QueryController)
        usageController = module.get<UsageController>(UsageController)
    })

    afterAll(async () => {
        await mongoConnection.dropDatabase()
        await mongoConnection.close()
        await mongod.stop()
    })

    afterEach(async () => {
        const collections = mongoConnection.collections
        for (const key in collections) {
            const collection = collections[key]
            await collection.deleteMany({})
        }
    })

    describe('handle queries', () => {
        let userID: string
        let adminID: string
        let req = mockRequestObject()
        beforeEach(async () => {
            const user = await new userModel(userFixture1).save()
            userID = user.id

            const admin = await new adminModel(adminFixture1).save()
            adminID = admin.id

            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const serviceID = (
                await new serviceModel({ name, description, baseAddress, type }).save()
            ).id
            for (const endpoint of endpoints) {
                await new serviceEndpointModel({ serviceID, ...endpoint }).save()
            }
        })

        it('should query service endpoint and return response for user', async () => {
            req.payload.id = userID
            req.payload.role = 'user'

            const type = serviceFixture1.type
            const version = 'v1'
            const task = serviceFixture1.endpoints[1].task
            const options = {
                message: 'this is a test message to test query controller',
                normalizeacronym: false,
                removedisfluency: true,
            }

            const response = await queryController.handleServiceEndpointRequest(
                type,
                version,
                task,
                options,
                req,
            )

            expect(response).toHaveProperty('uuid')
            expect(response).toHaveProperty('executionTime')
            expect(response).toHaveProperty('output')
        })

        it('should query service endpoint and return response for admin', async () => {
            req.payload.id = adminID
            req.payload.role = 'admin'

            const type = serviceFixture1.type
            const version = 'v1'
            const task = serviceFixture1.endpoints[1].task
            const options = {
                message: 'this is a test message to test query controller',
                normalizeacronym: false,
                removedisfluency: true,
            }

            const response = await queryController.handleServiceEndpointRequest(
                type,
                version,
                task,
                options,
                req,
            )

            expect(response).toHaveProperty('uuid')
            expect(response).toHaveProperty('executionTime')
            expect(response).toHaveProperty('output')
        })

        it('should return 404 - Not Found due to invalid service type', async () => {
            req.payload.id = userID
            req.payload.role = 'user'

            const type = 'Invalid Type'
            const version = 'v1'
            const task = serviceFixture1.endpoints[1].task
            const options = {
                message: 'this is a test message to test query controller',
                normalizeacronym: false,
                removedisfluency: true,
            }

            const message = 'Service not found. The requested resource could not be found.'
            await expect(
                queryController.handleServiceEndpointRequest(type, version, task, options, req),
            ).rejects.toThrow(new HttpException(message, HttpStatus.NOT_FOUND))
        })

        it('should return 404 - Not Found due to invalid service version', async () => {
            req.payload.id = userID
            req.payload.role = 'user'

            const type = serviceFixture1.type
            const version = 'v11'
            const task = serviceFixture1.endpoints[1].task
            const options = {
                message: 'this is a test message to test query controller',
                normalizeacronym: false,
                removedisfluency: true,
            }

            const message = 'Service not found. The requested resource could not be found.'
            await expect(
                queryController.handleServiceEndpointRequest(type, version, task, options, req),
            ).rejects.toThrow(new HttpException(message, HttpStatus.NOT_FOUND))
        })

        it('should return 404 - Not Found due to invalid endpoint task', async () => {
            req.payload.id = userID
            req.payload.role = 'user'

            const type = serviceFixture1.type
            const version = 'v1'
            const task = 'Invalid task'
            const options = {
                message: 'this is a test message to test query controller',
                normalizeacronym: false,
                removedisfluency: true,
            }

            const message = 'Endpoint not found. The requested resource could not be found.'
            await expect(
                queryController.handleServiceEndpointRequest(type, version, task, options, req),
            ).rejects.toThrow(new HttpException(message, HttpStatus.NOT_FOUND))
        })
    })

    describe('retrieve usages', () => {
        let userID: string[]
        let adminID: string
        let req = mockRequestObject()
        beforeEach(async () => {
            userID = []
            userID.push((await new userModel(userFixture1).save()).id)
            userID.push((await new userModel(userFixture2).save()).id)
            userID.push((await new userModel(userFixture3).save()).id)
            adminID = (await new adminModel(adminFixture1).save()).id

            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const service = await new serviceModel({ name, description, baseAddress, type }).save()
            let endpointID: string[] = []
            for (const endpoint of endpoints) {
                endpointID.push(
                    (await new serviceEndpointModel({ serviceID: service.id, ...endpoint }).save())
                        .id,
                )
            }

            const options = {
                options1: 'Test string message.',
                options2: 10,
                options3: true,
            }

            const output = {
                output1: 'Test string output.',
                output2: 99,
                output3: false,
            }

            const executionTime = [0.1, 5, 10]

            await new QueryModel({
                userID: userID[0],
                serviceID: service.id,
                type: service.type,
                version: service.version,
                endpointID: endpointID[0],
                options,
                output: JSON.stringify(output),
                executionTime: executionTime[0],
                isAdminQuery: false,
            }).save()

            await new QueryModel({
                userID: userID[1],
                serviceID: service.id,
                type: service.type,
                version: service.version,
                endpointID: endpointID[0],
                options,
                output: JSON.stringify(output),
                executionTime: executionTime[1],
                isAdminQuery: false,
            }).save()

            await new QueryModel({
                userID: userID[2],
                serviceID: service.id,
                type: service.type,
                version: service.version,
                endpointID: endpointID[1],
                options,
                output: JSON.stringify(output),
                executionTime: executionTime[2],
                isAdminQuery: false,
            }).save()
        })

        it('should retrieve all usages made by a specific user if user initiated the retrieval', async () => {
            req.payload.role = 'user'
            req.payload.id = userID[0]

            const response = await usageController.retrieveUsages(req)
            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(1)
            response.usages.forEach((item: Record<string, any>) => {
                expect(item).toHaveProperty('uuid')
                expect(item).toHaveProperty('executionTime')
                expect(item).toHaveProperty('output')
                expect(item).toHaveProperty('options')
                expect(item).toHaveProperty('dateTime')
            })
        })

        it('should retrieve all usages from all users if admin initiated the retrieval', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const response = await usageController.retrieveUsages(req)
            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(3)
            response.usages.forEach((item: Record<string, any>) => {
                expect(item).toHaveProperty('uuid')
                expect(item).toHaveProperty('executionTime')
                expect(item).toHaveProperty('output')
                expect(item).toHaveProperty('options')
                expect(item).toHaveProperty('dateTime')
            })
        })

        it('should retrieve no usages with execution time less than 0', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const executionTime = '0'
            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                executionTime,
            )

            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(0)
        })

        it('should retrieve usages with execution time less than specified number (test for 1 valid result)', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const executionTime = '0.101'
            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                executionTime,
            )

            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(1)
            response.usages.forEach((item: Record<string, any>) => {
                expect(item).toHaveProperty('uuid')
                expect(item).toHaveProperty('executionTime')
                expect(item).toHaveProperty('output')
                expect(item).toHaveProperty('options')
                expect(item).toHaveProperty('dateTime')
            })
        })

        it('should retrieve usages with execution time less than specified number (test for 2 valid results)', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const executionTime = '9.99'
            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                executionTime,
            )

            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(2)
            response.usages.forEach((item: Record<string, any>) => {
                expect(item).toHaveProperty('uuid')
                expect(item).toHaveProperty('executionTime')
                expect(item).toHaveProperty('output')
                expect(item).toHaveProperty('options')
                expect(item).toHaveProperty('dateTime')
            })
        })

        it('should retrieve usages with execution time less than specified number (test for 3 valid results)', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const executionTime = '10.0001'
            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                executionTime,
            )

            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(3)
            response.usages.forEach((item: Record<string, any>) => {
                expect(item).toHaveProperty('uuid')
                expect(item).toHaveProperty('executionTime')
                expect(item).toHaveProperty('output')
                expect(item).toHaveProperty('options')
                expect(item).toHaveProperty('dateTime')
            })
        })

        it('should retrieve no usages for start date later than the current date', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const startDate = new Date()
            startDate.setTime(startDate.getTime() + 1000)

            const startDateStr = startDate.toISOString()

            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDateStr,
            )

            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(0)
        })

        it('should retrieve no usages for end date earlier than the current date', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const endDate = new Date()
            endDate.setTime(endDate.getTime() - 1000)

            const endDateStr = endDate.toISOString()

            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                undefined,
                undefined,
                endDateStr,
            )

            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(0)
        })

        it('should retrieve usages for start date earlier than, and end date later than the current date (test for 3 valid results)', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const startDate = new Date()
            startDate.setTime(startDate.getTime() - 1000)
            const endDate = new Date()
            endDate.setTime(endDate.getTime() + 1000)

            const startDateStr = startDate.toISOString()
            const endDateStr = endDate.toISOString()

            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDateStr,
                endDateStr,
            )

            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(3)
        })

        it('should retrieve usages for start date earlier than, and end date later than the current date, given timezone in positive integer (test for 3 valid results)', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const timezone = '14'

            const startDate = new Date()
            startDate.setTime(startDate.getTime() - 1000)
            startDate.setUTCHours(startDate.getUTCHours() + Number.parseInt(timezone))
            startDate.setUTCMinutes(
                startDate.getUTCMinutes() + (Number.parseFloat(timezone) % 1) * 60,
            )
            const endDate = new Date()
            endDate.setTime(endDate.getTime() + 1000)
            endDate.setUTCHours(endDate.getUTCHours() + Number.parseInt(timezone))
            endDate.setUTCMinutes(endDate.getUTCMinutes() + (Number.parseFloat(timezone) % 1) * 60)

            const startDateStr = startDate.toISOString()
            const endDateStr = endDate.toISOString()

            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDateStr,
                endDateStr,
                timezone,
            )

            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(3)
        })

        it('should retrieve usages for start date earlier than, and end date later than the current date, given timezone in negative integer (test for 3 valid results)', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const timezone = '-12'

            const startDate = new Date()
            startDate.setTime(startDate.getTime() - 1000)
            startDate.setUTCHours(startDate.getUTCHours() + Number.parseInt(timezone))
            startDate.setUTCMinutes(
                startDate.getUTCMinutes() + (Number.parseFloat(timezone) % 1) * 60,
            )
            const endDate = new Date()
            endDate.setTime(endDate.getTime() + 1000)
            endDate.setUTCHours(endDate.getUTCHours() + Number.parseInt(timezone))
            endDate.setUTCMinutes(endDate.getUTCMinutes() + (Number.parseFloat(timezone) % 1) * 60)

            const startDateStr = startDate.toISOString()
            const endDateStr = endDate.toISOString()

            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDateStr,
                endDateStr,
                timezone,
            )

            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(3)
        })

        it('should retrieve usages for start date earlier than, and end date later than the current date, given timezone in positive float (test for 3 valid results)', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const timezone = '13.9'

            const startDate = new Date()
            startDate.setTime(startDate.getTime() - 1000)
            startDate.setUTCHours(startDate.getUTCHours() + Number.parseInt(timezone))
            startDate.setUTCMinutes(
                startDate.getUTCMinutes() +
                    Number((Number.parseFloat(timezone) % 1).toFixed(1)) * 60,
            )
            const endDate = new Date()
            endDate.setTime(endDate.getTime() + 1000)
            endDate.setUTCHours(endDate.getUTCHours() + Number.parseInt(timezone))
            endDate.setUTCMinutes(
                endDate.getUTCMinutes() + Number((Number.parseFloat(timezone) % 1).toFixed(1)) * 60,
            )

            const startDateStr = startDate.toISOString()
            const endDateStr = endDate.toISOString()

            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDateStr,
                endDateStr,
                timezone,
            )

            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(3)
        })

        it('should retrieve usages for start date earlier than, and end date later than the current date, given timezone in negative float (test for 3 valid results)', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const timezone = '-11.9'

            const startDate = new Date()
            startDate.setTime(startDate.getTime() - 1000)
            startDate.setUTCHours(startDate.getUTCHours() + Number.parseInt(timezone))
            startDate.setUTCMinutes(
                startDate.getUTCMinutes() +
                    Number((Number.parseFloat(timezone) % 1).toFixed(1)) * 60,
            )
            const endDate = new Date()
            endDate.setTime(endDate.getTime() + 1000)
            endDate.setUTCHours(endDate.getUTCHours() + Number.parseInt(timezone))
            endDate.setUTCMinutes(
                endDate.getUTCMinutes() + Number((Number.parseFloat(timezone) % 1).toFixed(1)) * 60,
            )

            const startDateStr = startDate.toISOString()
            const endDateStr = endDate.toISOString()

            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDateStr,
                endDateStr,
                timezone,
            )

            expect(Array.isArray(response.usages)).toBe(true)
            expect(response.usages.length).toBe(3)
        })

        it('should retrieve usages excluding those made by userID 0 if userID 0 is deleted and returnDelUser set to false', async () => {
            await userModel.deleteOne({ _id: userID[0] })

            const returnDelUser = false
            req.payload.id = adminID
            req.payload.role = 'admin'

            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                returnDelUser,
            )

            expect(response.usages.length).toBe(2)
        })

        it('should retrieve usages including those made by userID 0 if userID 0 is deleted and returnDelUser set to true', async () => {
            await userModel.deleteOne({ _id: userID[0] })

            const returnDelUser = true
            req.payload.id = adminID
            req.payload.role = 'admin'

            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                returnDelUser,
            )

            expect(response.usages.length).toBe(3)
        })

        it('should retrieve usages excluding those made on serviceFixture1 if serviceFixture1 is deleted and returnDelService set to false', async () => {
            await serviceModel.deleteOne({ type: serviceFixture1.type, version: 'v1' })
            const returnDelService = false
            req.payload.id = adminID
            req.payload.role = 'admin'

            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                returnDelService,
            )
            expect(response.usages.length).toBe(0)
        })

        it('should retrieve usages including those made on serviceFixture1 if serviceFixture1 is deleted and returnDelService set to true', async () => {
            await serviceModel.deleteOne({ type: serviceFixture1.type, version: 'v1' })
            const returnDelService = true
            req.payload.id = adminID
            req.payload.role = 'admin'

            const response = await usageController.retrieveUsages(
                req,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                returnDelService,
            )
            expect(response.usages.length).toBe(3)
            response.usages.forEach((item: Record<string, any>) => {
                expect(item).toHaveProperty('serviceDeleted', true)
            })
        })
    })

    describe('retrieve usage', () => {
        let userID: string[]
        let adminID: string
        let queryUUID: string[]
        beforeEach(async () => {
            userID = []
            userID.push((await new userModel(userFixture1).save()).id)
            userID.push((await new userModel(userFixture2).save()).id)
            userID.push((await new userModel(userFixture3).save()).id)
            adminID = (await new adminModel(adminFixture1).save()).id

            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const service = await new serviceModel({ name, description, baseAddress, type }).save()
            let endpointID: string[] = []
            for (const endpoint of endpoints) {
                endpointID.push(
                    (await new serviceEndpointModel({ serviceID: service.id, ...endpoint }).save())
                        .id,
                )
            }

            const options = {
                options1: 'Test string message.',
                options2: 10,
                options3: true,
            }

            const output = {
                output1: 'Test string output.',
                output2: 99,
                output3: false,
            }

            const executionTime = [0.1, 5, 10]

            queryUUID = []
            queryUUID.push(
                (
                    await new QueryModel({
                        userID: userID[0],
                        serviceID: service.id,
                        type: service.type,
                        version: service.version,
                        endpointID: endpointID[0],
                        options,
                        output: JSON.stringify(output),
                        executionTime: executionTime[0],
                        isAdminQuery: false,
                    }).save()
                ).uuid,
            )

            queryUUID.push(
                (
                    await new QueryModel({
                        userID: userID[1],
                        serviceID: service.id,
                        type: service.type,
                        version: service.version,
                        endpointID: endpointID[0],
                        options,
                        output: JSON.stringify(output),
                        executionTime: executionTime[1],
                        isAdminQuery: false,
                    }).save()
                ).uuid,
            )

            queryUUID.push(
                (
                    await new QueryModel({
                        userID: userID[2],
                        serviceID: service.id,
                        type: service.type,
                        version: service.version,
                        endpointID: endpointID[1],
                        options,
                        output: JSON.stringify(output),
                        executionTime: executionTime[2],
                        isAdminQuery: false,
                    }).save()
                ).uuid,
            )
        })

        it('should retrieve usage with the specified UUID, assumed UTC', async () => {
            const expectedUsage = await QueryModel.findOne({ uuid: queryUUID[0] })
            const response = await usageController.retrieveUsage(queryUUID[0])
            expect(response).toHaveProperty('uuid')
            expect(response).toHaveProperty('executionTime')
            expect(response).toHaveProperty('output')
            expect(response).toHaveProperty('options')
            expect(response).toHaveProperty('dateTime')
            expect(response.dateTime).toEqual(expectedUsage.dateTime)
        })

        it('should retrieve usage with the specified UUID, with dateTime displayed in given positive timezone', async () => {
            const timezone = '13.9'
            const expectedUsage = await QueryModel.findOne({ uuid: queryUUID[1] })
            let expectedDateTime = expectedUsage.dateTime
            expectedDateTime.setUTCHours(expectedDateTime.getUTCHours() + Number.parseInt(timezone))
            expectedDateTime.setUTCMinutes(
                expectedDateTime.getUTCMinutes() +
                    Number((Number.parseFloat(timezone) % 1).toFixed(1)) * 60,
            )

            const response = await usageController.retrieveUsage(queryUUID[1], timezone)
            expect(response).toHaveProperty('uuid')
            expect(response).toHaveProperty('executionTime')
            expect(response).toHaveProperty('output')
            expect(response).toHaveProperty('options')
            expect(response).toHaveProperty('dateTime')
            expect(response.dateTime).toEqual(expectedDateTime)
        })

        it('should retrieve usage with the specified UUID, with dateTime displayed in given negative timezone', async () => {
            const timezone = '-11.9'
            const expectedUsage = await QueryModel.findOne({ uuid: queryUUID[1] })
            let expectedDateTime = expectedUsage.dateTime
            expectedDateTime.setUTCHours(expectedDateTime.getUTCHours() + Number.parseInt(timezone))
            expectedDateTime.setUTCMinutes(
                expectedDateTime.getUTCMinutes() +
                    Number((Number.parseFloat(timezone) % 1).toFixed(1)) * 60,
            )

            const response = await usageController.retrieveUsage(queryUUID[1], timezone)
            expect(response).toHaveProperty('uuid')
            expect(response).toHaveProperty('executionTime')
            expect(response).toHaveProperty('output')
            expect(response).toHaveProperty('options')
            expect(response).toHaveProperty('dateTime')
            expect(response.dateTime).toEqual(expectedDateTime)
        })

        it('should return 404 - Not Found due to invalid uuid', async () => {
            const uuid = 'invalid-uuid-1'
            const message = 'Usage not found. The requested resource could not be found.'
            await expect(usageController.retrieveUsage(uuid)).rejects.toThrow(
                new HttpException(message, HttpStatus.NOT_FOUND),
            )
        })
    })
})
