import { Test, TestingModule } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { ServiceController } from '../services.controller'
import { ServiceService } from '../services.service'
import { Connection, connect, Model } from 'mongoose'
import { getModelToken } from '@nestjs/mongoose'
import {
    Service,
    ServiceEndpoint,
    ServiceEndpointSchema,
    ServiceModel,
    ServiceSchema,
    ServiceType,
} from '../services.model'
import { HttpException, HttpStatus } from '@nestjs/common'
import { mockRequestObject } from '../../common/test/mock/common.model'
import {
    endpointFixture3dup1,
    endpointFixture3dup2,
    serviceFixture1,
    serviceFixture2,
} from './fixtures/services.fixture'

describe('ServiceController', () => {
    let serviceController: ServiceController

    let mongod: MongoMemoryServer
    let mongoConnection: Connection

    let serviceModel: Model<Service>
    let serviceEndpointModel: Model<ServiceEndpoint>

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        const uri = mongod.getUri()
        mongoConnection = (await connect(uri)).connection

        serviceModel = mongoConnection.model(Service.name, ServiceSchema)
        serviceEndpointModel = mongoConnection.model(ServiceEndpoint.name, ServiceEndpointSchema)

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServiceController],
            providers: [
                ServiceService,
                { provide: getModelToken(Service.name), useValue: serviceModel },
                { provide: getModelToken(ServiceEndpoint.name), useValue: serviceEndpointModel },
            ],
        }).compile()

        serviceController = module.get<ServiceController>(ServiceController)
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

    describe('register service', () => {
        beforeEach(async () => {
            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const serviceID = (
                await new ServiceModel({ name, description, baseAddress, type }).save()
            ).id
            for (const endpoint of endpoints) {
                await new serviceEndpointModel({ serviceID, ...endpoint }).save()
            }
        })

        it('should register service and return success message', async () => {
            const { name, description, baseAddress, type, endpoints } = serviceFixture2
            const response = await serviceController.createService(
                name,
                description,
                baseAddress,
                type,
                endpoints,
            )
            expect(response.message).toBe('Service registered.')
        })

        it('should return 409 - Conflict due to duplicated address', async () => {
            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            await expect(
                serviceController.createService(name, description, baseAddress, type, endpoints),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid address. There is another service of the same address.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 409 - Conflict due to duplicated endpoint task', async () => {
            let localFixture = JSON.parse(JSON.stringify(serviceFixture2))
            localFixture.endpoints.push(endpointFixture3dup1)
            const { name, description, baseAddress, type, endpoints } = localFixture

            await expect(
                serviceController.createService(name, description, baseAddress, type, endpoints),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid task. There is another endpoint of the same task for the specified service.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 409 - Conflict due to duplicated endpoint method', async () => {
            let localFixture = JSON.parse(JSON.stringify(serviceFixture2))
            localFixture.endpoints.push(endpointFixture3dup2)
            const { name, description, baseAddress, type, endpoints } = localFixture

            await expect(
                serviceController.createService(name, description, baseAddress, type, endpoints),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid method. There is another endpoint of the same method and endpointPath for the specified service.',
                    HttpStatus.CONFLICT,
                ),
            )
        })
    })

    describe('update service', () => {
        beforeEach(async () => {
            const {
                name: name1,
                description: description1,
                baseAddress: baseAddress1,
                type: type1,
                endpoints: endpoints1,
            } = serviceFixture1
            const serviceID1 = (
                await new ServiceModel({
                    name: name1,
                    description: description1,
                    baseAddress: baseAddress1,
                    type: type1,
                }).save()
            ).id
            for (const endpoint of endpoints1) {
                await new serviceEndpointModel({ serviceID: serviceID1, ...endpoint }).save()
            }

            const {
                name: name2,
                description: description2,
                baseAddress: baseAddress2,
                type: type2,
                endpoints: endpoints2,
            } = serviceFixture2
            const serviceID2 = (
                await new ServiceModel({
                    name: name2,
                    description: description2,
                    baseAddress: baseAddress2,
                    type: type2,
                }).save()
            ).id
            for (const endpoint of endpoints2) {
                await new serviceEndpointModel({ serviceID: serviceID2, ...endpoint }).save()
            }
        })

        it('should update service and return success message', async () => {
            const updatedName = 'Service 002 - Test service 2 (Updated)'
            const updatedDescription = 'This is test service 2 (Updated).'
            const updatedAddress = 'https://example.com/service2/updated'
            const updatedType = 'NER'
            const updatedVersion = 'v1'

            const type = serviceFixture2.type
            const version = 'v2'

            const response = await serviceController.updateService(
                type,
                version,
                updatedName,
                updatedVersion,
                updatedDescription,
                updatedAddress,
                updatedType,
            )

            expect(response.message).toEqual('Service updated.')
        })

        it('should return 409 - Conflict due to duplicated address', async () => {
            const updatedName = 'Service 002 - Test service 2 (Updated)'
            const updatedDescription = 'This is test service 2 (Updated).'
            const updatedAddress = 'https://sud.speechlab.sg'
            const updatedType = 'NER'
            const updatedVersion = 'v1'

            const type = serviceFixture2.type
            const version = 'v2'

            await expect(
                serviceController.updateService(
                    type,
                    version,
                    updatedName,
                    updatedVersion,
                    updatedDescription,
                    updatedAddress,
                    updatedType,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid address. There is another service of the same address.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 409 - Conflict due to duplicated type and version', async () => {
            const updatedName = 'Service 002 - Test service 2 (Updated)'
            const updatedDescription = 'This is test service 2 (Updated).'
            const updatedAddress = 'https://example.com/service2/updated'
            const updatedType = 'SUD'
            const updatedVersion = 'v1'

            const type = serviceFixture2.type
            const version = 'v2'

            await expect(
                serviceController.updateService(
                    type,
                    version,
                    updatedName,
                    updatedVersion,
                    updatedDescription,
                    updatedAddress,
                    updatedType,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid type and version. There is another service of the same type and version.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 404 - Not Found due to invalid type', async () => {
            const type = 'SUR'
            const version = 'v1'

            const updatedName = 'Minimal Reproducible Error PH'
            const updatedDescription = 'Minimal Reproducible Error PH'
            const updatedAddress = 'Minimal Reproducible Error PH'
            const updatedType = 'SUD'
            const updatedVersion = 'v1'

            await expect(
                serviceController.updateService(
                    type,
                    version,
                    updatedName,
                    updatedVersion,
                    updatedDescription,
                    updatedAddress,
                    updatedType,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })

        it('should return 404 - Not Found due to invalid version', async () => {
            const type = serviceFixture2.type
            const version = 'v3'

            const updatedName = 'Minimal Reproducible Error PH'
            const updatedDescription = 'Minimal Reproducible Error PH'
            const updatedAddress = 'Minimal Reproducible Error PH'
            const updatedType = 'SUD'
            const updatedVersion = 'v1'

            await expect(
                serviceController.updateService(
                    type,
                    version,
                    updatedName,
                    updatedVersion,
                    updatedDescription,
                    updatedAddress,
                    updatedType,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('remove service', () => {
        beforeEach(async () => {
            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const serviceID1 = (
                await new ServiceModel({
                    name,
                    description,
                    baseAddress,
                    type,
                }).save()
            ).id
            for (const endpoint of endpoints) {
                await new serviceEndpointModel({ serviceID: serviceID1, ...endpoint }).save()
            }
        })

        it('should remove service and return success message', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const response = await serviceController.deleteService(type, version)

            expect(response.message).toEqual('Service unsubscribed.')
        })

        it('should return 404 - Not Found due to invalid type', async () => {
            const version = 'v1'
            const type = 'SUR'

            expect(serviceController.deleteService(type, version)).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })

        it('should return 404 - Not Found due to invalid version', async () => {
            const type = serviceFixture1.type
            const version = 'v19'

            expect(serviceController.deleteService(type, version)).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('retrieve services', () => {
        beforeEach(async () => {
            const {
                name: name1,
                description: description1,
                baseAddress: baseAddress1,
                type: type1,
                endpoints: endpoints1,
            } = serviceFixture1
            const serviceID1 = (
                await new ServiceModel({
                    name: name1,
                    description: description1,
                    baseAddress: baseAddress1,
                    type: type1,
                }).save()
            ).id
            for (const endpoint of endpoints1) {
                await new serviceEndpointModel({ serviceID: serviceID1, ...endpoint }).save()
            }

            const {
                name: name2,
                description: description2,
                baseAddress: baseAddress2,
                type: type2,
                endpoints: endpoints2,
            } = serviceFixture2
            const serviceID2 = (
                await new ServiceModel({
                    name: name2,
                    description: description2,
                    baseAddress: baseAddress2,
                    type: type2,
                }).save()
            ).id
            for (const endpoint of endpoints2) {
                await new serviceEndpointModel({ serviceID: serviceID2, ...endpoint }).save()
            }
        })

        it('should retrieve all services, with service address displayed for admin', async () => {
            const req = mockRequestObject()
            req.payload.role = 'admin'
            const response = await serviceController.retrieveServices(req)
            expect(response.services.length).toBe(2)
            response.services.every((service) => expect(service).toHaveProperty('address'))
        })

        it('should retrieve all services, without service address displayed for user', async () => {
            const req = mockRequestObject()
            req.payload.role = 'user'
            const response = await serviceController.retrieveServices(req)
            expect(response.services.length).toBe(2)
            response.services.every((service) => expect(service).not.toHaveProperty('address'))
        })

        it('should retrieve services with specified type (test for 2 valid results)', async () => {
            const req = mockRequestObject()
            const type = 'SUD'
            const response = await serviceController.retrieveServices(req, undefined, type)
            expect(response.services.length).toEqual(2)
        })

        it('should retrieve no services if type is not found', async () => {
            const req = mockRequestObject()
            const type = 'SUR'
            const response = await serviceController.retrieveServices(req, undefined, type)
            expect(response.services.length).toEqual(0)
        })

        it('should retrieve services with name matching the specified name (test for 1 valid result)', async () => {
            const req = mockRequestObject()
            const name = 'test service 2'
            const response = await serviceController.retrieveServices(req, name)
            expect(response.services.length).toEqual(1)
        })

        it('should retrieve services with name matching the specified name (test for 2 valid result)', async () => {
            const req = mockRequestObject()
            const name = 'test'
            const response = await serviceController.retrieveServices(req, name)
            expect(response.services.length).toEqual(2)
        })

        it('should retrieve no services if no services have name matching the specified name', async () => {
            const req = mockRequestObject()
            const name = 'no match'
            const response = await serviceController.retrieveServices(req, name)
            expect(response.services.length).toEqual(0)
        })
    })

    describe('retrieve a service', () => {
        beforeEach(async () => {
            const genesisService = {
                name: 'Test name',
                description: 'Test description.',
                address: 'https://test-test.com',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'Test task',
                endpointPath: '/test',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            await serviceController.createService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint],
            )
        })

        it('should retrieve a service based on type and version', async () => {
            const validType = 'SUD'
            const validVersion = 'v1'
            const req = mockRequestObject()
            req.payload.role = 'admin'
            let returnedService = await serviceController.retrieveService(
                req,
                validType,
                validVersion,
            )
            expect(returnedService).toHaveProperty('name')
            expect(returnedService).toHaveProperty('description')
            expect(returnedService).toHaveProperty('type')
            expect(returnedService).toHaveProperty('version')
            expect(returnedService).toHaveProperty('address')

            req.payload.role = 'user'
            returnedService = await serviceController.retrieveService(req, validType, validVersion)
            expect(returnedService).toHaveProperty('name')
            expect(returnedService).toHaveProperty('description')
            expect(returnedService).toHaveProperty('type')
            expect(returnedService).toHaveProperty('version')
        })

        it('should return 404 - NOT FOUND due to invalid type', async () => {
            const invalidType = 'TUR'
            const validVersion = 'v12'
            const req = mockRequestObject()
            await expect(
                serviceController.retrieveService(req, invalidType, validVersion),
            ).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })

        it('should return 404 - NOT FOUND due to invalid version', async () => {
            const validType = 'SUD'
            const invalidVersion = 'v2'
            const req = mockRequestObject()
            await expect(
                serviceController.retrieveService(req, validType, invalidVersion),
            ).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('add endpoint', () => {
        beforeEach(async () => {
            const genesisService = {
                name: 'Test name',
                description: 'Test description.',
                address: 'https://test-test.com',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'Test task',
                endpointPath: '/test',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            await serviceController.createService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint],
            )
        })

        it('should add endpoint and return success message', async () => {
            const validType = 'SUD'
            const validVersion = 'v1'

            const endpointData = {
                task: 'Test task 2',
                endpointPath: '/test2',
                method: 'POST',
                options: {
                    autocheck: 'boolean',
                },
            }

            const returnedMessage = await serviceController.createEndpoint(
                validType,
                validVersion,
                endpointData.method,
                endpointData.endpointPath,
                endpointData.task,
                endpointData.options,
            )

            expect(returnedMessage.message).toEqual('Endpoint registered.')
        })

        it('should return 409 - CONFLICT due to duplicated endpointPath and method', async () => {
            const validType = 'SUD'
            const validVersion = 'v1'

            const endpointData = {
                task: 'Test task 2',
                endpointPath: '/test',
                method: 'POST',
                options: {
                    autocheck: 'boolean',
                },
            }

            await expect(
                serviceController.createEndpoint(
                    validType,
                    validVersion,
                    endpointData.method,
                    endpointData.endpointPath,
                    endpointData.task,
                    endpointData.options,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid method. There is another endpoint of the same method and endpointPath for the specified service.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 409 - CONFLICT due to duplicated task', async () => {
            const validType = 'SUD'
            const validVersion = 'v1'

            const endpointData = {
                task: 'Test task',
                endpointPath: '/test2',
                method: 'POST',
                options: {
                    autocheck: 'boolean',
                },
                textBased: true,
            }

            await expect(
                serviceController.createEndpoint(
                    validType,
                    validVersion,
                    endpointData.method,
                    endpointData.endpointPath,
                    endpointData.task,
                    endpointData.options,
                    endpointData.textBased,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid task. There is another endpoint of the same task for the specified service.',
                    HttpStatus.CONFLICT,
                ),
            )
        })
    })

    describe('update endpoint', () => {
        beforeEach(async () => {
            const genesisService = {
                name: 'Test name',
                description: 'Test description.',
                address: 'https://test-test.com',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'Test task',
                endpointPath: '/test',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            const secondEndpoint = {
                task: 'Test task 2',
                endpointPath: '/test2',
                method: 'POST',
                options: {
                    auto: 'string',
                },
            }

            await serviceController.createService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint, secondEndpoint],
            )
        })

        it('should update endpoint and return success message', async () => {
            const updatedEndpointData = {
                task: 'Test task3',
                endpointPath: '/test3',
                method: 'GET',
                options: {
                    normalize: 'boolean',
                },
            }
            const validType = 'SUD'
            const validVersion = 'v1'
            const validTask = 'Test task 2'

            const updatedEndpoint = await serviceController.updateEndpoint(
                validType,
                validVersion,
                validTask,
                updatedEndpointData.method,
                updatedEndpointData.endpointPath,
                updatedEndpointData.task,
                updatedEndpointData.options,
            )

            expect(updatedEndpoint.message).toEqual('Endpoint updated.')
        })

        it('should return 409 - CONFLICT due to duplicated task', async () => {
            const validType = 'SUD'
            const validVersion = 'v1'
            const validTask = 'Test task 2'

            const updatedEndpointData = {
                task: 'Test task',
                endpointPath: '/test2',
                method: 'POST',
                options: {
                    autocheck: 'boolean',
                },
            }

            await expect(
                serviceController.updateEndpoint(
                    validType,
                    validVersion,
                    validTask,
                    updatedEndpointData.method,
                    updatedEndpointData.endpointPath,
                    updatedEndpointData.task,
                    updatedEndpointData.options,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid task. There is another endpoint of the same task for the specified service.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 409 - CONFLICT due to duplicated method and endpointPath', async () => {
            const validType = 'SUD'
            const validVersion = 'v1'
            const validTask = 'Test task 2'

            const updatedEndpointData = {
                task: 'Test task',
                endpointPath: '/test',
                method: 'POST',
                options: {
                    autocheck: 'boolean',
                },
            }

            await expect(
                serviceController.updateEndpoint(
                    validType,
                    validVersion,
                    validTask,
                    updatedEndpointData.method,
                    updatedEndpointData.endpointPath,
                    updatedEndpointData.task,
                    updatedEndpointData.options,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid method. There is another endpoint of the same method for the specified service.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 404 - NOT FOUND due to invalid type and version', async () => {
            const invalidType = 'SUR'
            const invalidVersion = 'v22'
            const validTask = 'Test task 2'

            const updatedEndpointData = {
                task: 'Test task',
                endpointPath: '/test2',
                method: 'POST',
                options: {
                    autocheck: 'boolean',
                },
            }

            await expect(
                serviceController.updateEndpoint(
                    invalidType,
                    invalidVersion,
                    validTask,
                    updatedEndpointData.method,
                    updatedEndpointData.endpointPath,
                    updatedEndpointData.task,
                    updatedEndpointData.options,
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
            const invalidTask = 'Test task 19'

            const updatedEndpointData = {
                task: 'Test task',
                endpointPath: '/test2',
                method: 'POST',
                options: {
                    autocheck: 'boolean',
                },
            }

            await expect(
                serviceController.updateEndpoint(
                    validType,
                    validVersion,
                    invalidTask,
                    updatedEndpointData.method,
                    updatedEndpointData.endpointPath,
                    updatedEndpointData.task,
                    updatedEndpointData.options,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Endpoint not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('remove endpoint', () => {
        beforeEach(async () => {
            const genesisService = {
                name: 'Test name',
                description: 'Test description.',
                address: 'https://test-test.com',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'Test task',
                endpointPath: '/test',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            const secondEndpoint = {
                task: 'Test task 2',
                endpointPath: '/test2',
                method: 'POST',
                options: {
                    auto: 'string',
                },
            }

            await serviceController.createService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint, secondEndpoint],
            )
        })

        it('should remove endpoint and return success message', async () => {
            const validType = 'SUD'
            const validVersion = 'v1'
            const validTask = 'Test task'

            const removedMessage = await serviceController.deleteEndpoint(
                validType,
                validVersion,
                validTask,
            )

            expect(removedMessage.message).toEqual('Endpoint deleted.')
        })

        it('should return 404 - NOT FOUND due to invalid type and version', async () => {
            const invalidType = 'NER'
            const invalidVersion = 'v12'
            const validTask = 'Test task'

            await expect(
                serviceController.deleteEndpoint(invalidType, invalidVersion, validTask),
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
            const invalidTask = 'Test task 17'

            await expect(
                serviceController.deleteEndpoint(validType, validVersion, invalidTask),
            ).rejects.toThrow(
                new HttpException(
                    'Endpoint not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('retrieve endpoints', () => {
        beforeEach(async () => {
            const genesisService = {
                name: 'Test name',
                description: 'Test description.',
                address: 'https://test-test.com',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'Test task',
                endpointPath: '/test',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            const secondEndpoint = {
                task: 'Test task 2',
                endpointPath: '/test2',
                method: 'POST',
                options: {
                    auto: 'string',
                },
            }

            await serviceController.createService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint, secondEndpoint],
            )
        })

        it('should retrieve all endpoints', async () => {
            const validType = 'SUD'
            const validVersion = 'v1'

            let returnedEndpoints = await serviceController.getEndpoints(validType, validVersion)
            expect(returnedEndpoints.endpoints.length).toEqual(2)
            returnedEndpoints.endpoints.every((endpoint: Record<string, any>) => {
                expect(endpoint).toHaveProperty('method')
                expect(endpoint).toHaveProperty('task')
                expect(endpoint).toHaveProperty('options')
                expect(endpoint).toHaveProperty('textBased')
            })

            const validMethod = 'POST'
            returnedEndpoints = await serviceController.getEndpoints(
                validType,
                validVersion,
                undefined,
                validMethod,
            )
            expect(returnedEndpoints.endpoints.length).toEqual(2)
            returnedEndpoints.endpoints.every((endpoint: Record<string, any>) => {
                expect(endpoint).toHaveProperty('method')
                expect(endpoint).toHaveProperty('task')
                expect(endpoint).toHaveProperty('options')
                expect(endpoint).toHaveProperty('textBased')
            })

            const invalidTask = 'predict'
            returnedEndpoints = await serviceController.getEndpoints(
                validType,
                validVersion,
                invalidTask,
            )
            expect(returnedEndpoints.endpoints.length).toEqual(0)

            const invalidMethod = 'PUT'
            returnedEndpoints = await serviceController.getEndpoints(
                validType,
                validVersion,
                undefined,
                invalidMethod,
            )
            expect(returnedEndpoints.endpoints.length).toEqual(0)
        })

        it('should return an endpoint with the specified task name', async () => {
            const validTask = 'Test task 2'
            const validType = 'SUD'
            const validVersion = 'v1'

            const returnedEndpoints = await serviceController.getEndpoints(
                validType,
                validVersion,
                validTask,
            )

            expect(returnedEndpoints.endpoints.length).toEqual(1)
            returnedEndpoints.endpoints.every((endpoint: Record<string, any>) => {
                expect(endpoint).toHaveProperty('method')
                expect(endpoint).toHaveProperty('task')
                expect(endpoint).toHaveProperty('options')
                expect(endpoint).toHaveProperty('textBased')
            })
        })

        it('should return 404 - NOT FOUND due to invalid type and version', async () => {
            const invalidType = 'SUR'
            const invalidVersion = 'v11'

            await expect(
                serviceController.getEndpoints(invalidType, invalidVersion),
            ).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('retrieve an endpoint', () => {
        beforeEach(async () => {
            const genesisService = {
                name: 'Test name',
                description: 'Test description.',
                address: 'https://test-test.com',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'Test task',
                endpointPath: '/test',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            const secondEndpoint = {
                task: 'Test task 2',
                endpointPath: '/test2',
                method: 'POST',
                options: {
                    auto: 'string',
                },
            }

            await serviceController.createService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint, secondEndpoint],
            )
        })

        it('should retrieve an endpoint based on type, version and task name', async () => {
            const validTask = 'Test task 2'
            const validType = 'SUD'
            const validVersion = 'v1'

            const returnedEndpoint = await serviceController.retrieveEndpoint(
                validType,
                validVersion,
                validTask,
            )

            expect(returnedEndpoint).toHaveProperty('task')
            expect(returnedEndpoint).toHaveProperty('method')
            expect(returnedEndpoint).toHaveProperty('options')
        })

        it('should return 404 - NOT FOUND due to invalid type and version', async () => {
            const invalidType = 'SUR'
            const invalidVersion = 'v11'
            const validTask = 'Test task 2'

            await expect(
                serviceController.retrieveEndpoint(invalidType, invalidVersion, validTask),
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
            const invalidTask = 'Test task 21'

            await expect(
                serviceController.retrieveEndpoint(validType, validVersion, invalidTask),
            ).rejects.toThrow(
                new HttpException(
                    'Endpoint not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('retrieve types of service', () => {
        beforeEach(async () => {
            const genesisService = {
                name: 'Test name',
                description: 'Test description.',
                address: 'https://test-test.com',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'Test task',
                endpointPath: '/test',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            const secondService = {
                name: 'Test name 2',
                description: 'Test description 2.',
                address: 'https://test2-test.com',
                type: 'NER',
            }

            await serviceController.createService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint],
            )

            await serviceController.createService(
                secondService.name,
                secondService.description,
                secondService.address,
                secondService.type,
                [genesisEndpoint],
            )
        })

        it('should return all service types', async () => {
            const returnedServiceTypes = await serviceController.retrieveServiceTypes()
            expect(returnedServiceTypes.types).toEqual(Object.values(ServiceType))
        })
    })

    describe('retrieve all versions of a service type', () => {
        beforeEach(async () => {
            const genesisService = {
                name: 'Test name',
                description: 'Test description.',
                address: 'https://test-test.com',
                type: 'SUD',
            }

            const genesisEndpoint = {
                task: 'Test task',
                endpointPath: '/test',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            const secondService = {
                name: 'Test name 2',
                description: 'Test description 2.',
                address: 'https://test2-test.com',
                type: 'NER',
            }

            await serviceController.createService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint],
            )

            await serviceController.createService(
                secondService.name,
                secondService.description,
                secondService.address,
                secondService.type,
                [genesisEndpoint],
            )
        })

        it('should return all versions of a service type', async () => {
            const validType = 'SUD'
            const returnedServiceTypes = await serviceController.retrieveServiceVersion(validType)
            expect(returnedServiceTypes.versions.length).toEqual(1)
        })

        it('should return 404 - NOT FOUND due to invalid service type', async () => {
            const invalidType = 'SUR'
            await expect(serviceController.retrieveServiceVersion(invalidType)).rejects.toThrow(
                new HttpException(
                    `Invalid type. Expected any of ${Object.values(ServiceType).join(
                        ', ',
                    )}, but received ${invalidType}`,
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })
})
