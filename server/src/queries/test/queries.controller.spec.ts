import { MongoMemoryServer } from 'mongodb-memory-server'
import { Connection, Model, connect } from 'mongoose'
import { Query, QuerySchema } from '../queries.model'
import { Test, TestingModule } from '@nestjs/testing'
import { QueryController, UsageController } from '../queries.controller'
import { QueryService } from '../queries.service'
import { getModelToken } from '@nestjs/mongoose'
import { ServiceController } from '../../services/services.controller'
import {
    Service,
    ServiceEndpoint,
    ServiceEndpointSchema,
    ServiceSchema,
} from '../../services/services.model'
import { Admin, AdminSchema, User, UserModel, UserSchema } from '../../users/users.model'
import { ServiceService } from '../../services/services.service'
import { mockRequestObject } from '../../common/test/mock/common.model'
import { HttpException, HttpStatus } from '@nestjs/common'
import { UserController } from '../../users/users.controller'
import { UserService } from '../../users/users.service'

describe('QueriesController', () => {
    let queryController: QueryController
    let serviceController: ServiceController
    let usageController: UsageController
    let userController: UserController
    let mongod: MongoMemoryServer
    let mongoConnection: Connection
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

        const app: TestingModule = await Test.createTestingModule({
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
        queryController = app.get<QueryController>(QueryController)
        serviceController = app.get<ServiceController>(ServiceController)
        usageController = app.get<UsageController>(UsageController)
        userController = app.get<UserController>(UserController)
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

    describe('query a service', () => {
        let userID: string

        beforeEach(async () => {
            const genesisService = {
                name: 'SUD Auto-punctuator',
                description: 'This service helps to auto-punctuate English sentences.',
                address: 'https://sud.speechlab.sg',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'predict',
                endpointPath: '/backend_predict',
                method: 'POST',
                options: {
                    message: 'string',
                    removedisfluency: 'boolean',
                    normalizeacronym: 'boolean',
                },
            }

            const genesisUser = {
                username: 'User01',
                name: 'John Doe',
                email: 'test@example.com',
                password: 'password123',
                department: 'SCSE',
            }

            await serviceController.subscribeService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint],
            )

            const user = await new userModel({
                ...genesisUser,
            })
            userID = user.id
            user.save()
        })

        it('should query a specified service successfully and return the result', async () => {
            const validType = 'SUD'
            const validVersion = 'v1'
            const validTask = 'predict'
            const options = {
                message:
                    'this is a test message or is it i dont really know but i know it is meant to test this auto punctuation service check the output',
                removedisfluency: false,
                normalizeacronym: true,
            }

            const req = mockRequestObject()
            req.payload.role = 'user'
            req.payload.id = userID

            const response = await queryController.handleServiceEndpointRequest(
                validType,
                validVersion,
                validTask,
                options,
                req,
                undefined,
            )

            expect(response).toHaveProperty('uuid')
            expect(response).toHaveProperty('executionTime')
            expect(response).toHaveProperty('output')
        })

        it('should return 404 - NOT FOUND due to invalid type and version', async () => {
            const invalidType = 'SUR'
            const invalidVersion = 'v11'
            const validTask = 'predict'
            const options = {
                message:
                    'this is a test message or is it i dont really know but i know it is meant to test this auto punctuation service check the output',
                removedisfluency: false,
                normalizeacronym: true,
            }

            const req = mockRequestObject()
            req.payload.role = 'user'
            req.payload.id = userID

            await expect(
                queryController.handleServiceEndpointRequest(
                    invalidType,
                    invalidVersion,
                    validTask,
                    options,
                    req,
                    undefined,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })

        it('should return 404 - NOT FOUND due to invalid task name', async () => {
            const validType = 'SUD'
            const validVersion = 'v1'
            const invalidTask = 'change_lang'
            const options = {
                message:
                    'this is a test message or is it i dont really know but i know it is meant to test this auto punctuation service check the output',
                removedisfluency: false,
                normalizeacronym: true,
            }

            const req = mockRequestObject()
            req.payload.role = 'user'
            req.payload.id = userID

            await expect(
                queryController.handleServiceEndpointRequest(
                    validType,
                    validVersion,
                    invalidTask,
                    options,
                    req,
                    undefined,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Endpoint not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('retrieve usages', () => {
        let uuid: string[] = []
        let userID: string[] = []
        let adminID: string

        beforeEach(async () => {
            uuid = []
            userID = []
            const genesisService = {
                name: 'SUD Auto-punctuator',
                description: 'This service helps to auto-punctuate English sentences.',
                baseAddress: 'https://sud.speechlab.sg',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'predict',
                endpointPath: '/backend_predict',
                method: 'POST',
                options: {
                    message: 'string',
                    removedisfluency: 'boolean',
                    normalizeacronym: 'boolean',
                },
            }

            const genesisUser = {
                username: 'User01',
                name: 'John Doe',
                email: 'test@example.com',
                password: 'password123',
                department: 'SCSE',
            }

            const secondUser = {
                username: 'User02',
                name: 'John Smith',
                email: 'test2@example.com',
                password: 'password456',
                department: 'MAE',
            }

            const genesisAdmin = {
                username: 'Admin01',
                name: 'Jane Doe',
                email: 'admin@example.com',
                password: 'admin123',
                department: 'SCSE',
            }

            const service = new serviceModel({ ...genesisService })
            const endpoint = new serviceEndpointModel({ serviceID: service.id, ...genesisEndpoint })
            const user = await new userModel({ ...genesisUser })
            const user2 = new userModel({ ...secondUser })
            const admin = new adminModel({ ...genesisAdmin })

            await service.save()
            await endpoint.save()
            await user.save()
            await user2.save()
            await admin.save()

            const options = {
                message:
                    'this is a test message or is it i dont really know but i know it is meant to test this auto punctuation service check the output',
                removedisfluency: false,
                normalizeacronym: true,
            }

            const options2 = {
                message:
                    'this is the 2nd test message or is it i dont really know but i know it is meant to test this auto punctuation service check the output',
                removedisfluency: false,
                normalizeacronym: true,
            }

            const query = new queryModel({
                serviceID: service.id,
                endpointID: endpoint.id,
                userID: user.id,
                options,
                output: 'Mock output.',
                executionTime: 1.5,
            })

            const query2 = new queryModel({
                serviceID: service.id,
                endpointID: endpoint.id,
                userID: user2.id,
                options: options2,
                output: 'Mock output.',
                executionTime: 3,
            })

            await query.save()
            await query2.save()

            uuid.push(query.uuid)
            uuid.push(query2.uuid)
            userID.push(user.id)
            userID.push(user2.id)
            adminID = admin.id
        })

        it('should retrieve all usages', async () => {
            const req = mockRequestObject()
            req.payload.id = userID[0]
            req.payload.role = 'user'
            let returnedUsages = await usageController.getUsages(req)
            expect(returnedUsages.usages.length).toEqual(1)
            returnedUsages.usages.every((usage: Query) => {
                expect(usage).toHaveProperty('uuid')
                expect(usage).toHaveProperty('executionTime')
                expect(usage).toHaveProperty('dateTime')
                expect(usage).toHaveProperty('output')
                expect(usage).toHaveProperty('options')
            })

            req.payload.id = adminID
            req.payload.role = 'admin'
            returnedUsages = await usageController.getUsages(req)
            expect(returnedUsages.usages.length).toEqual(2)
            returnedUsages.usages.every((usage: Query) => {
                expect(usage).toHaveProperty('uuid')
                expect(usage).toHaveProperty('executionTime')
                expect(usage).toHaveProperty('dateTime')
                expect(usage).toHaveProperty('output')
                expect(usage).toHaveProperty('options')
            })
        })

        it('should retrieve only queries with execution time less than specified seconds', async () => {
            const execTime = '2'
            const req = mockRequestObject()
            req.payload.id = userID[0]
            req.payload.role = 'user'
            let returnedUsages = await usageController.getUsages(
                req,
                undefined,
                undefined,
                execTime,
            )

            expect(returnedUsages.usages.length).toEqual(1)

            req.payload.id = userID[1]
            returnedUsages = await usageController.getUsages(req, undefined, undefined, execTime)
            expect(returnedUsages.usages.length).toEqual(0)

            req.payload.id = adminID
            req.payload.role = 'admin'
            returnedUsages = await usageController.getUsages(req, undefined, undefined, execTime)
            expect(returnedUsages.usages.length).toEqual(1)
        })

        it('should return queries made on the specified service', async () => {
            let validType = 'SUD'
            let validVersion = 'v1'

            const req = mockRequestObject()
            req.payload.id = userID[0]
            req.payload.role = 'user'
            let returnedUsages = await usageController.getUsages(req, validType, validVersion)
            expect(returnedUsages.usages.length).toEqual(1)

            validType = 'NER'
            validVersion = 'v1'
            returnedUsages = await usageController.getUsages(req, validType, validVersion)
            expect(returnedUsages.usages.length).toEqual(0)

            validType = 'SUD'
            validVersion = 'v1'
            req.payload.id = adminID
            req.payload.role = 'admin'
            returnedUsages = await usageController.getUsages(req, validType, validVersion)
            expect(returnedUsages.usages.length).toEqual(2)
        })

        it('should return all queries made on the specified start date and after', async () => {
            let startDate = '2022-10-01'
            const req = mockRequestObject()
            req.payload.id = userID[0]
            req.payload.role = 'user'
            let returnedUsages = await usageController.getUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDate,
            )
            expect(returnedUsages.usages.length).toEqual(1)

            startDate = new Date().toDateString()
            returnedUsages = await usageController.getUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDate,
            )
            expect(returnedUsages.usages.length).toEqual(1)

            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            startDate = tomorrow.toDateString()

            returnedUsages = await usageController.getUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDate,
            )
            expect(returnedUsages.usages.length).toEqual(0)
        })

        it('should return queries made on the end date and before', async () => {
            let endDate
            const req = mockRequestObject()
            req.payload.id = userID[0]
            req.payload.role = 'user'

            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            endDate = tomorrow.toDateString()

            let returnedUsages = await usageController.getUsages(
                req,
                undefined,
                undefined,
                undefined,
                undefined,
                endDate,
            )
            expect(returnedUsages.usages.length).toEqual(1)

            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            endDate = yesterday.toDateString()

            returnedUsages = await usageController.getUsages(
                req,
                undefined,
                undefined,
                undefined,
                undefined,
                endDate,
            )
            expect(returnedUsages.usages.length).toEqual(0)
        })

        it('should return queries made between the specified start date and end date', async () => {
            let startDate, endDate
            const req = mockRequestObject()
            req.payload.id = userID[0]
            req.payload.role = 'user'

            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            endDate = tomorrow.toDateString()

            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            startDate = yesterday.toDateString()

            let returnedUsages = await usageController.getUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDate,
                endDate,
            )
            expect(returnedUsages.usages.length).toEqual(1)

            const nextWeek = new Date()
            nextWeek.setDate(nextWeek.getDate() + 7)
            startDate = nextWeek.toDateString()
            returnedUsages = await usageController.getUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDate,
                endDate,
            )
            expect(returnedUsages.usages.length).toEqual(0)
        })

        it('should return queries made between the specified start date and end date, in user timezone', async () => {
            let startDate, endDate
            let timezone = 8
            const req = mockRequestObject()
            req.payload.id = userID[0]
            req.payload.role = 'user'

            let tomorrow = new Date()
            tomorrow.setTime(tomorrow.getTime() + timezone * 60 * 60 * 1000)
            tomorrow.setDate(tomorrow.getDate() + 1)
            endDate = tomorrow.toISOString()

            let yesterday = new Date()
            yesterday.setTime(yesterday.getTime() + timezone * 60 * 60 * 1000)
            yesterday.setDate(yesterday.getDate() - 1)
            startDate = yesterday.toISOString()

            let returnedUsages = await usageController.getUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDate,
                endDate,
                timezone.toString(),
            )
            expect(returnedUsages.usages.length).toEqual(1)

            tomorrow = new Date()
            tomorrow.setTime(tomorrow.getTime() + timezone * 60 * 60 * 1000)
            tomorrow.setDate(tomorrow.getDate() + 1)
            endDate = tomorrow.toISOString().slice(0, 10)

            yesterday = new Date()
            yesterday.setTime(yesterday.getTime() + timezone * 60 * 60 * 1000)
            yesterday.setDate(yesterday.getDate() - 1)
            startDate = yesterday.toISOString().slice(0, 10)

            returnedUsages = await usageController.getUsages(
                req,
                undefined,
                undefined,
                undefined,
                startDate,
                endDate,
                timezone.toString(),
            )
            expect(returnedUsages.usages.length).toEqual(1)
        })

        it('should include deleted user query if returnDelUser is true', async () => {
            const returnDelUser = true
            const req = mockRequestObject()
            req.payload.role = 'admin'
            req.payload.id = adminID
            await userController.removeUser('User01')
            const returnedUsages = await usageController.getUsages(
                req,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                returnDelUser,
                undefined,
            )
            expect(returnedUsages.usages.length).toEqual(2)
            expect(returnedUsages.usages[0]).toHaveProperty('userDeleted')
        })

        it('should include queries made on deleted service if returnDelService is true', async () => {
            const returnDelService = true
            const req = mockRequestObject()
            req.payload.role = 'admin'
            req.payload.id = adminID
            await serviceController.unsubscribeService('SUD', 'v1')
            const returnedUsages = await usageController.getUsages(
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
            expect(returnedUsages.usages.length).toEqual(2)
            returnedUsages.usages.every((usage: Record<string, any>) => {
                expect(usage).toHaveProperty('serviceDeleted')
            })
        })
    })

    describe('retrieve a usage', () => {
        let uuid: string
        let userID: string
        let adminID: string

        beforeEach(async () => {
            const genesisService = {
                name: 'SUD Auto-punctuator',
                description: 'This service helps to auto-punctuate English sentences.',
                baseAddress: 'https://sud.speechlab.sg',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'predict',
                endpointPath: '/backend_predict',
                method: 'POST',
                options: {
                    message: 'string',
                    removedisfluency: 'boolean',
                    normalizeacronym: 'boolean',
                },
            }

            const genesisUser = {
                username: 'User01',
                name: 'John Doe',
                email: 'test@example.com',
                password: 'password123',
                department: 'SCSE',
            }

            const genesisAdmin = {
                username: 'Admin01',
                name: 'Jane Doe',
                email: 'admin@example.com',
                password: 'admin123',
                department: 'SCSE',
            }

            const service = new serviceModel({ ...genesisService })
            const endpoint = new serviceEndpointModel({ serviceID: service.id, ...genesisEndpoint })
            const user = await new userModel({ ...genesisUser })
            const admin = new adminModel({ ...genesisAdmin })

            await service.save()
            await endpoint.save()
            await user.save()
            await admin.save()

            const options = {
                message:
                    'this is a test message or is it i dont really know but i know it is meant to test this auto punctuation service check the output',
                removedisfluency: false,
                normalizeacronym: true,
            }

            const query = new queryModel({
                serviceID: service.id,
                endpointID: endpoint.id,
                userID: user.id,
                options,
                output: 'Mock output.',
                executionTime: 1.5,
            })

            await query.save()

            uuid = query.uuid
            userID = user.id
            adminID = admin.id
        })

        it('should retrieve a usage', async () => {
            const returnedUsage = await usageController.getUsage(uuid)
            expect(returnedUsage).toBeDefined()
            expect(returnedUsage).toHaveProperty('executionTime')
            expect(returnedUsage).toHaveProperty('dateTime')
            expect(returnedUsage).toHaveProperty('output')
            expect(returnedUsage).toHaveProperty('options')
        })

        it('should return 404 - NOT FOUND due to invalid uuid', async () => {
            const invalidUUID = 'testUUID'
            await expect(usageController.getUsage(invalidUUID)).rejects.toThrow(
                new HttpException(
                    'Usage not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('remove a usage', () => {
        let uuid: string
        let userID: string
        let adminID: string

        beforeEach(async () => {
            const genesisService = {
                name: 'SUD Auto-punctuator',
                description: 'This service helps to auto-punctuate English sentences.',
                baseAddress: 'https://sud.speechlab.sg',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'predict',
                endpointPath: '/backend_predict',
                method: 'POST',
                options: {
                    message: 'string',
                    removedisfluency: 'boolean',
                    normalizeacronym: 'boolean',
                },
            }

            const genesisUser = {
                username: 'User01',
                name: 'John Doe',
                email: 'test@example.com',
                password: 'password123',
                department: 'SCSE',
            }

            const genesisAdmin = {
                username: 'Admin01',
                name: 'Jane Doe',
                email: 'admin@example.com',
                password: 'admin123',
                department: 'SCSE',
            }

            const service = new serviceModel({ ...genesisService })
            const endpoint = new serviceEndpointModel({ serviceID: service.id, ...genesisEndpoint })
            const user = await new userModel({ ...genesisUser })
            const admin = new adminModel({ ...genesisAdmin })

            await service.save()
            await endpoint.save()
            await user.save()
            await admin.save()

            const options = {
                message:
                    'this is a test message or is it i dont really know but i know it is meant to test this auto punctuation service check the output',
                removedisfluency: false,
                normalizeacronym: true,
            }

            const query = new queryModel({
                serviceID: service.id,
                endpointID: endpoint.id,
                userID: user.id,
                options,
                output: 'Mock output.',
                executionTime: 1.5,
            })

            await query.save()

            uuid = query.uuid
            userID = user.id
            adminID = admin.id
        })

        it('should remove the usage successfully', async () => {
            const returnedMessage = await usageController.removeUsage(uuid)
            expect(returnedMessage.message).toEqual('Usage deleted.')
            const query = queryModel.findOne({ uuid }).exec()
            expect(query).not.toBeNull()
        })

        it('should return 404 - NOT FOUND due to invalid uuid', async () => {
            const invalidUUID = 'uuid123'
            await expect(usageController.removeUsage(invalidUUID)).rejects.toThrow(
                new HttpException(
                    'Usage not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })
})
