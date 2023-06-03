import { MongoMemoryServer } from 'mongodb-memory-server'
import { Connection, Model, connect } from 'mongoose'
import { Query, QueryModel, QuerySchema } from '../queries.model'
import { Test, TestingModule } from '@nestjs/testing'
import { QueryController, UsageController } from '../queries.controller'
import { QueryService } from '../queries.service'
import { getModelToken } from '@nestjs/mongoose'
import { ServiceController } from '../../services/services.controller'
import {
    Service,
    ServiceEndpoint,
    ServiceEndpointSchema,
    ServiceModel,
    ServiceSchema,
} from '../../services/services.model'
import {
    Admin,
    AdminModel,
    AdminSchema,
    User,
    UserModel,
    UserSchema,
} from '../../users/users.model'
import { ServiceService } from '../../services/services.service'
import { mockRequestObject } from '../../common/test/mock/common.model'
import { HttpException, HttpStatus } from '@nestjs/common'
import { UserController } from '../../users/users.controller'
import { UserService } from '../../users/users.service'
import {
    adminFixture1,
    userFixture1,
    userFixture2,
    userFixture3,
} from '../../users/test/fixtures/users.fixture'
import {
    endpointFixture1,
    endpointFixture2,
    serviceFixture1,
} from '../../services/test/fixtures/services.fixture'

describe('QueriesController', () => {
    let mongod: MongoMemoryServer
    let mongoConnection: Connection

    let queryController: QueryController
    let serviceController: ServiceController
    let usageController: UsageController
    let userController: UserController

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
        serviceController = module.get<ServiceController>(ServiceController)
        usageController = module.get<UsageController>(UsageController)
        userController = module.get<UserController>(UserController)
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
            const user = await new UserModel(userFixture1).save()
            userID = user.id

            const admin = await new AdminModel(adminFixture1).save()
            adminID = admin.id

            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const serviceID = (
                await new ServiceModel({ name, description, baseAddress, type }).save()
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
            userID.push((await new UserModel(userFixture1).save()).id)
            userID.push((await new UserModel(userFixture2).save()).id)
            userID.push((await new UserModel(userFixture3).save()).id)
            adminID = (await new AdminModel(adminFixture1).save()).id

            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const serviceID = (
                await new ServiceModel({ name, description, baseAddress, type }).save()
            ).id
            let endpointID: string[] = []
            for (const endpoint of endpoints) {
                endpointID.push(
                    (await new serviceEndpointModel({ serviceID, ...endpoint }).save()).id,
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
                serviceID,
                endpointID: endpointID[0],
                options,
                output: JSON.stringify(output),
                executionTime: executionTime[0],
                isAdminQuery: false,
            }).save()

            await new QueryModel({
                userID: userID[1],
                serviceID,
                endpointID: endpointID[0],
                options,
                output: JSON.stringify(output),
                executionTime: executionTime[1],
                isAdminQuery: false,
            }).save()

            await new QueryModel({
                userID: userID[2],
                serviceID,
                endpointID: endpointID[1],
                options,
                output: JSON.stringify(output),
                executionTime: executionTime[2],
                isAdminQuery: false,
            }).save()
        })

        it('should retrieve all usages for userID 0', async () => {
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

        it('should retrieve all usages from all users for admin', async () => {
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

        it('should retrieve 1 usage with execution time less than 0.101', async () => {
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

        it('should retrieve 2 usages with execution time less than 9.99', async () => {
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

        it('should retrieve all usages with execution time less than 10.0001', async () => {
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

        it('should retrieve all usages for start date earlier than, and end date later than the current date', async () => {
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

        it('should retrieve all usages for start date earlier than, and end date later than the current date, given timezone in positive integer', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const timezone = '14'

            const startDate = new Date()
            startDate.setTime(startDate.getTime() - 1000)
            startDate.setHours(startDate.getHours() + Number.parseInt(timezone))
            startDate.setMinutes(startDate.getMinutes() + (Number.parseFloat(timezone) % 1) * 60)
            const endDate = new Date()
            endDate.setTime(endDate.getTime() + 1000)
            endDate.setHours(endDate.getHours() + Number.parseInt(timezone))
            endDate.setMinutes(endDate.getMinutes() + (Number.parseFloat(timezone) % 1) * 60)

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

        it('should retrieve all usages for start date earlier than, and end date later than the current date, given timezone in negative integer', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const timezone = '-12'

            const startDate = new Date()
            startDate.setTime(startDate.getTime() - 1000)
            startDate.setHours(startDate.getHours() + Number.parseInt(timezone))
            startDate.setMinutes(startDate.getMinutes() + (Number.parseFloat(timezone) % 1) * 60)
            const endDate = new Date()
            endDate.setTime(endDate.getTime() + 1000)
            endDate.setHours(endDate.getHours() + Number.parseInt(timezone))
            endDate.setMinutes(endDate.getMinutes() + (Number.parseFloat(timezone) % 1) * 60)

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

        it('should retrieve all usages for start date earlier than, and end date later than the current date, given timezone in positive float', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const timezone = '13.9'

            const startDate = new Date()
            startDate.setTime(startDate.getTime() - 1000)
            startDate.setHours(startDate.getHours() + Number.parseInt(timezone))
            startDate.setMinutes(startDate.getMinutes() + (Number.parseFloat(timezone) % 1) * 60)
            const endDate = new Date()
            endDate.setTime(endDate.getTime() + 1000)
            endDate.setHours(endDate.getHours() + Number.parseInt(timezone))
            endDate.setMinutes(endDate.getMinutes() + (Number.parseFloat(timezone) % 1) * 60)

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

        it('should retrieve all usages for start date earlier than, and end date later than the current date, given timezone in negative float', async () => {
            req.payload.role = 'admin'
            req.payload.id = adminID

            const timezone = '-11.9'

            const startDate = new Date()
            startDate.setTime(startDate.getTime() - 1000)
            startDate.setHours(startDate.getHours() + Number.parseInt(timezone))
            startDate.setMinutes(
                startDate.getMinutes() + Number((Number.parseFloat(timezone) % 1).toFixed(1)) * 60,
            )
            const endDate = new Date()
            endDate.setTime(endDate.getTime() + 1000)
            endDate.setHours(endDate.getHours() + Number.parseInt(timezone))
            endDate.setMinutes(
                endDate.getMinutes() + Number((Number.parseFloat(timezone) % 1).toFixed(1)) * 60,
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

        it('should retrieve 2 usages with userID 0 deleted and returnDelUser set to false', async () => {
            await UserModel.deleteOne({ _id: userID[0] })

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

        it('should retrieve all usages with userID 0 deleted and returnDelUser set to true', async () => {
            await UserModel.deleteOne({ _id: userID[0] })

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

        it('should retrieve no usages with serviceFixture1 deleted and returnDelService set to false', async () => {
            await ServiceModel.deleteOne({ type: serviceFixture1.type, version: 'v1' })
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

        it('should retrieve all usages with serviceFixture1 deleted and returnDelService set to true', async () => {
            await ServiceModel.deleteOne({ type: serviceFixture1.type, version: 'v1' })
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
})
