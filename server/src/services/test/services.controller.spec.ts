import { Test, TestingModule } from '@nestjs/testing'
import { HttpException, HttpStatus } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Connection, connect, Model } from 'mongoose'

import { ServiceController } from '../services.controller'
import { ServiceService } from '../services.service'
import {
    Service,
    ServiceType,
    ServiceEndpoint,
    ServiceEndpointSchema,
    ServiceSchema,
} from '../services.model'
import {
    serviceFixture1,
    serviceFixture2,
    endpointFixture1,
    endpointFixture2,
    endpointFixture3,
    endpointFixture3dup1,
    endpointFixture3dup2,
} from './fixtures/services.fixture'
import { mockRequestObject } from '../../common/test/mock/common.model'

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
                await new serviceModel({ name, description, baseAddress, type }).save()
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
                await new serviceModel({
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
                await new serviceModel({
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
                await new serviceModel({
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

            const req = mockRequestObject()
            req.payload.role = 'admin'
            await expect(serviceController.retrieveService(req, type, version)).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
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
                await new serviceModel({
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
                await new serviceModel({
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
            response.services.every((service) => {
                expect(service).toHaveProperty('name')
                expect(service).toHaveProperty('description')
                expect(service).toHaveProperty('type')
                expect(service).toHaveProperty('version')
                expect(service).toHaveProperty('address')
            })
        })

        it('should retrieve all services, without service address displayed for user', async () => {
            const req = mockRequestObject()
            req.payload.role = 'user'
            const response = await serviceController.retrieveServices(req)
            expect(response.services.length).toBe(2)
            response.services.every((service) => {
                expect(service).not.toHaveProperty('address')
                expect(service).toHaveProperty('name')
                expect(service).toHaveProperty('description')
                expect(service).toHaveProperty('type')
                expect(service).toHaveProperty('version')
            })
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
            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const serviceID1 = (
                await new serviceModel({
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

        it('should retrieve a service based on type and version, with service address displayed for admin', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const req = mockRequestObject()
            req.payload.role = 'admin'

            const response = await serviceController.retrieveService(req, type, version)
            expect(response).toHaveProperty('name')
            expect(response).toHaveProperty('description')
            expect(response).toHaveProperty('type')
            expect(response).toHaveProperty('version')
            expect(response).toHaveProperty('address')
        })

        it('should retrieve a service based on type and version, without service address displayed for admin', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const req = mockRequestObject()
            req.payload.role = 'user'

            const response = await serviceController.retrieveService(req, type, version)
            expect(response).toHaveProperty('name')
            expect(response).toHaveProperty('description')
            expect(response).toHaveProperty('type')
            expect(response).toHaveProperty('version')
            expect(response).not.toHaveProperty('address')
        })

        it('should return 404 - Not Found due to invalid type', async () => {
            const type = 'Invalid type'
            const version = 'v1'
            const req = mockRequestObject()
            await expect(serviceController.retrieveService(req, type, version)).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })

        it('should return 404 - Not Found due to invalid version', async () => {
            const type = serviceFixture1.type
            const version = 'v2'
            const req = mockRequestObject()
            await expect(serviceController.retrieveService(req, type, version)).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('add endpoint', () => {
        beforeEach(async () => {
            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const serviceID1 = (
                await new serviceModel({
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

        it('should add endpoint and return success message', async () => {
            const type = 'SUD'
            const version = 'v1'

            const { method, task, textBased, options, endpointPath } = endpointFixture3

            const response = await serviceController.createEndpoint(
                type,
                version,
                method,
                endpointPath,
                task,
                options,
                textBased,
            )

            expect(response.message).toEqual('Endpoint registered.')
        })

        it('should return 409 - Conflict due to duplicated endpointPath and method', async () => {
            const type = serviceFixture1.type
            const version = 'v1'

            const { task, textBased, options } = endpointFixture3
            const { method, endpointPath } = serviceFixture1.endpoints[0]

            await expect(
                serviceController.createEndpoint(
                    type,
                    version,
                    method,
                    endpointPath,
                    task,
                    options,
                    textBased,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid method. There is another endpoint of the same method and endpointPath for the specified service.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 409 - Conflict due to duplicated task', async () => {
            const type = serviceFixture1.type
            const version = 'v1'

            const { method, endpointPath, textBased, options } = endpointFixture3
            const { task } = serviceFixture1.endpoints[0]

            await expect(
                serviceController.createEndpoint(
                    type,
                    version,
                    method,
                    endpointPath,
                    task,
                    options,
                    textBased,
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
            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const serviceID1 = (
                await new serviceModel({
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

        it('should update endpoint and return success message', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const task = serviceFixture1.endpoints[0].task

            const updatedMethod = 'GET'
            const updatedEndpointPath = '/lang_change(updated)'
            const updatedTask = 'lang-change(updated)'
            const updatedOptions = {
                fav_language: 'string',
                punc_type: 'string',
                updated: 'boolean',
            }

            const response = await serviceController.updateEndpoint(
                type,
                version,
                task,
                updatedMethod,
                updatedEndpointPath,
                updatedTask,
                updatedOptions,
            )

            expect(response.message).toEqual('Endpoint updated.')
        })

        it('should return 409 - Conflict due to duplicated task', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const task = serviceFixture1.endpoints[0].task

            const updatedMethod = 'GET'
            const updatedEndpointPath = '/lang_change(updated)'
            const updatedTask = endpointFixture2.task
            const updatedOptions = {
                fav_language: 'string',
                punc_type: 'string',
                updated: 'boolean',
            }

            await expect(
                serviceController.updateEndpoint(
                    type,
                    version,
                    task,
                    updatedMethod,
                    updatedEndpointPath,
                    updatedTask,
                    updatedOptions,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid task. There is another endpoint of the same task for the specified service.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 409 - Conflict due to duplicated method and endpointPath', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const task = serviceFixture1.endpoints[0].task

            const updatedMethod = endpointFixture2.method
            const updatedEndpointPath = endpointFixture2.endpointPath
            const updatedTask = 'lang-change(updated)'
            const updatedOptions = {
                fav_language: 'string',
                punc_type: 'string',
                updated: 'boolean',
            }

            await expect(
                serviceController.updateEndpoint(
                    type,
                    version,
                    task,
                    updatedMethod,
                    updatedEndpointPath,
                    updatedTask,
                    updatedOptions,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid method. There is another endpoint of the same method for the specified service.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 404 - Not Found due to invalid type and version', async () => {
            const type = 'Invalid type'
            const version = 'v22'
            const task = endpointFixture1.task

            const updatedMethod = 'GET'
            const updatedEndpointPath = '/lang_change(updated)'
            const updatedTask = 'lang-change(updated)'
            const updatedOptions = {
                fav_language: 'string',
                punc_type: 'string',
                updated: 'boolean',
            }

            await expect(
                serviceController.updateEndpoint(
                    type,
                    version,
                    task,
                    updatedMethod,
                    updatedEndpointPath,
                    updatedTask,
                    updatedOptions,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })

        it('should return 404 - Not Found due to invalid task name', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const task = 'Invalid task name'

            const updatedMethod = 'GET'
            const updatedEndpointPath = '/lang_change(updated)'
            const updatedTask = 'lang-change(updated)'
            const updatedOptions = {
                fav_language: 'string',
                punc_type: 'string',
                updated: 'boolean',
            }

            await expect(
                serviceController.updateEndpoint(
                    type,
                    version,
                    task,
                    updatedMethod,
                    updatedEndpointPath,
                    updatedTask,
                    updatedOptions,
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
            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const serviceID1 = (
                await new serviceModel({
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

        it('should remove endpoint and return success message', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const task = serviceFixture1.endpoints[0].task

            const response = await serviceController.deleteEndpoint(type, version, task)

            expect(response.message).toEqual('Endpoint deleted.')

            const endpoints = await serviceController.retrieveEndpoints(type, version)
            expect(endpoints.endpoints.length).toBe(1)
            await expect(serviceController.retrieveEndpoint(type, version, task)).rejects.toThrow(
                new HttpException(
                    'Endpoint not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })

        it('should return 404 - Not Found due to invalid type and version', async () => {
            const type = 'Invalid type'
            const version = 'v12'
            const task = serviceFixture1.endpoints[0].task

            await expect(serviceController.deleteEndpoint(type, version, task)).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })

        it('should return 404 - Not Found due to invalid task name', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const task = 'Invalid task name'

            await expect(serviceController.deleteEndpoint(type, version, task)).rejects.toThrow(
                new HttpException(
                    'Endpoint not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('retrieve endpoints', () => {
        beforeEach(async () => {
            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const serviceID1 = (
                await new serviceModel({
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

        it('should retrieve all endpoints', async () => {
            const validType = serviceFixture1.type
            const validVersion = 'v1'

            let returnedEndpoints = await serviceController.retrieveEndpoints(
                validType,
                validVersion,
            )
            expect(returnedEndpoints.endpoints.length).toEqual(2)
            returnedEndpoints.endpoints.every((endpoint: Record<string, any>) => {
                expect(endpoint).toHaveProperty('method')
                expect(endpoint).toHaveProperty('task')
                expect(endpoint).toHaveProperty('options')
                expect(endpoint).toHaveProperty('textBased')
            })
        })

        it('should retrieve all endpoints with the specified method', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const method = serviceFixture1.endpoints[0].method

            const response = await serviceController.retrieveEndpoints(
                type,
                version,
                undefined,
                method,
            )
            expect(response.endpoints.length).toEqual(2)
            response.endpoints.every((endpoint: Record<string, any>) => {
                expect(endpoint).toHaveProperty('method')
                expect(endpoint).toHaveProperty('task')
                expect(endpoint).toHaveProperty('options')
                expect(endpoint).toHaveProperty('textBased')
            })
        })

        it('should retrieve no endpoints with an invalid method', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const method = 'PUT'

            const response = await serviceController.retrieveEndpoints(
                type,
                version,
                undefined,
                method,
            )
            expect(response.endpoints.length).toEqual(0)
        })

        it('should retrieve an endpoint with the specified task name', async () => {
            const task = serviceFixture1.endpoints[0].task
            const type = serviceFixture1.type
            const version = 'v1'

            const response = await serviceController.retrieveEndpoints(type, version, task)

            expect(response.endpoints.length).toEqual(1)
            response.endpoints.every((endpoint: Record<string, any>) => {
                expect(endpoint).toHaveProperty('method')
                expect(endpoint).toHaveProperty('task')
                expect(endpoint).toHaveProperty('options')
                expect(endpoint).toHaveProperty('textBased')
            })
        })

        it('should retrive no endpoints with an invalid task name', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const task = 'Invalid task name'

            const response = await serviceController.retrieveEndpoints(type, version, task)
            expect(response.endpoints.length).toEqual(0)
        })

        it('should return 404 - Not Found due to invalid type and version', async () => {
            const type = 'Invalid type'
            const version = 'v11'

            await expect(serviceController.retrieveEndpoints(type, version)).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('retrieve an endpoint', () => {
        beforeEach(async () => {
            const { name, description, baseAddress, type, endpoints } = serviceFixture1
            const serviceID1 = (
                await new serviceModel({
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

        it('should retrieve an endpoint based on type, version and task name', async () => {
            const task = serviceFixture1.endpoints[0].task
            const type = serviceFixture1.type
            const version = 'v1'

            let response = await serviceController.retrieveEndpoint(type, version, task)

            expect(response).toHaveProperty('task', serviceFixture1.endpoints[0].task)
            expect(response).toHaveProperty('method', serviceFixture1.endpoints[0].method)
            expect(response).toHaveProperty('options')

            response = JSON.parse(JSON.stringify(response))
            expect(response.options).toEqual(serviceFixture1.endpoints[0].options)
        })

        it('should return 404 - Not Found due to invalid type and version', async () => {
            const type = 'Invalid type'
            const version = 'v11'
            const task = serviceFixture1.endpoints[0].task

            await expect(serviceController.retrieveEndpoint(type, version, task)).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })

        it('should return 404 - Not Found due to invalid task name', async () => {
            const type = serviceFixture1.type
            const version = 'v1'
            const task = 'Invalid task name'

            await expect(serviceController.retrieveEndpoint(type, version, task)).rejects.toThrow(
                new HttpException(
                    'Endpoint not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('retrieve types of service', () => {
        it('should return all service types', async () => {
            const returnedServiceTypes = await serviceController.retrieveServiceTypes()
            expect(returnedServiceTypes.types).toEqual(Object.values(ServiceType))
        })
    })

    describe('retrieve all versions of a service type', () => {
        beforeEach(async () => {
            const {
                name: name1,
                description: description1,
                baseAddress: baseAddress1,
                type: type1,
                endpoints: endpoints1,
            } = serviceFixture1
            const serviceID1 = (
                await new serviceModel({
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
                await new serviceModel({
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

        it('should return all versions of a service type', async () => {
            const type = serviceFixture1.type
            const response = await serviceController.retrieveServiceVersion(type)
            expect(response.versions.length).toEqual(2)
            expect(response.versions).toContain('v1')
            expect(response.versions).toContain('v2')
        })

        it('should return 404 - Not Found due to invalid service type', async () => {
            const type = 'Invalid type'
            await expect(serviceController.retrieveServiceVersion(type)).rejects.toThrow(
                new HttpException(
                    `Invalid type. Expected any of ${Object.values(ServiceType).join(
                        ', ',
                    )}, but received ${type}`,
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })
})
