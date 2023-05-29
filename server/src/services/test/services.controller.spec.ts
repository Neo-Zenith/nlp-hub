import { Test, TestingModule } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { ServiceController } from '../services.controller'
import { ServiceService } from '../services.service'
import { Connection, connect, Model } from 'mongoose'
import { getModelToken } from '@nestjs/mongoose'
import { Service, ServiceEndpoint, ServiceEndpointSchema, ServiceSchema } from '../services.model'
import { HttpException, HttpStatus } from '@nestjs/common'
import { mockRequestObject } from './mock/common.model'

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

        const app: TestingModule = await Test.createTestingModule({
            controllers: [ServiceController],
            providers: [
                ServiceService,
                { provide: getModelToken(Service.name), useValue: serviceModel },
                { provide: getModelToken(ServiceEndpoint.name), useValue: serviceEndpointModel },
            ],
        }).compile()
        serviceController = app.get<ServiceController>(ServiceController)
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

            await serviceController.subscribeService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint],
            )
        })

        it('should register service and return success message', async () => {
            const serviceData = {
                name: 'SUD Auto-punctuator',
                description: 'Test description.',
                address: 'https://sud-speechlab.sg',
                type: 'SUD',
            }

            const endpointData = {
                task: 'predict',
                endpointPath: '/predict',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            const expectedOutput = 'Service registered.'
            const createdMessage = await serviceController.subscribeService(
                serviceData.name,
                serviceData.description,
                serviceData.address,
                serviceData.type,
                [endpointData],
            )

            expect(createdMessage.message).toBe(expectedOutput)
        })

        it('should return 409 - CONFLICT due to duplicated address', async () => {
            const serviceData = {
                name: 'SUD Auto-punctuator',
                description: 'Test description.',
                address: 'https://test-test.com', // same address as genesis
                type: 'SUD',
            }

            const endpointData = {
                task: 'predict',
                endpointPath: '/predict',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            await expect(
                serviceController.subscribeService(
                    serviceData.name,
                    serviceData.description,
                    serviceData.address,
                    serviceData.type,
                    [endpointData],
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid address. There is another service of the same address.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 409 - CONFLICT due to duplicated endpoint task', async () => {
            const serviceData = {
                name: 'SUD Auto-punctuator',
                description: 'Test description.',
                address: 'https://test2-test.com',
                type: 'SUD',
            }

            const endpointData1 = {
                task: 'predict',
                endpointPath: '/predict',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            const endpointData2 = {
                task: 'predict',
                endpointPath: '/predict2',
                method: 'GET',
                options: {
                    passes: 'number',
                    lang: 'string',
                },
            }

            await expect(
                serviceController.subscribeService(
                    serviceData.name,
                    serviceData.description,
                    serviceData.address,
                    serviceData.type,
                    [endpointData1, endpointData2],
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid task. There is another endpoint of the same task for the specified service.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 409 - CONFLICT due to duplicated endpoint method', async () => {
            const serviceData = {
                name: 'SUD Auto-punctuator',
                description: 'Test description.',
                address: 'https://test2-test.com',
                type: 'SUD',
            }

            const endpointData1 = {
                task: 'predict',
                endpointPath: '/predict',
                method: 'POST',
                options: {
                    removeIsFluency: 'boolean',
                },
            }

            const endpointData2 = {
                task: 'change-lang',
                endpointPath: '/predict',
                method: 'POST',
                options: {
                    passes: 'number',
                    lang: 'string',
                },
            }

            await expect(
                serviceController.subscribeService(
                    serviceData.name,
                    serviceData.description,
                    serviceData.address,
                    serviceData.type,
                    [endpointData1, endpointData2],
                ),
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
                description: 'Test description.',
                address: 'https://test2-test.com',
                type: 'SUD',
            }

            await serviceController.subscribeService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint],
            )

            await serviceController.subscribeService(
                secondService.name,
                secondService.description,
                secondService.address,
                secondService.type,
                [genesisEndpoint],
            )
        })

        it('should update service and return success message', async () => {
            const updatedServiceData = {
                name: 'SUD Auto-punctuator Updated',
                description: 'Test description updated.',
                address: 'https://sud-speechlab.sg/updated',
                type: 'NER',
                version: 'v2',
            }

            const validType = 'SUD'
            const validVersion = 'v1'

            const updatedMessage = await serviceController.updateService(
                validType,
                validVersion,
                updatedServiceData.name,
                updatedServiceData.version,
                updatedServiceData.description,
                updatedServiceData.address,
                updatedServiceData.type,
            )

            expect(updatedMessage.message).toEqual('Service updated.')
        })

        it('should return 409 - CONFLICT due to duplicated address', async () => {
            const updatedServiceData = {
                name: 'SUD Auto-punctuator Updated',
                description: 'Test description updated.',
                address: 'https://test-test.com',
                type: 'NER',
                version: 'v2',
            }

            const validType = 'SUD'
            const validVersion = 'v2'

            await expect(
                serviceController.updateService(
                    validType,
                    validVersion,
                    updatedServiceData.name,
                    updatedServiceData.version,
                    updatedServiceData.description,
                    updatedServiceData.address,
                    updatedServiceData.type,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid address. There is another service of the same address.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 409 - CONFLICT due to duplicated type and version', async () => {
            const updatedServiceData = {
                name: 'SUD Auto-punctuator Updated',
                description: 'Test description updated.',
                address: 'https://sud-speechlab.sg/second',
                type: 'SUD',
                version: 'v1',
            }

            const validType = 'SUD'
            const validVersion = 'v2'

            await expect(
                serviceController.updateService(
                    validType,
                    validVersion,
                    updatedServiceData.name,
                    updatedServiceData.version,
                    updatedServiceData.description,
                    updatedServiceData.address,
                    updatedServiceData.type,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Invalid type and version. There is another service of the same type and version.',
                    HttpStatus.CONFLICT,
                ),
            )
        })

        it('should return 404 - NOT FOUND due to invalid type', async () => {
            const invalidType = 'SUR'
            const validVersion = 'v1'

            const updatedServiceData = {
                name: 'SUD Auto-punctuator Updated',
                description: 'Test description updated.',
                address: 'https://sud-speechlab.sg/second',
                type: 'NER',
                version: 'v2',
            }

            await expect(
                serviceController.updateService(
                    invalidType,
                    validVersion,
                    updatedServiceData.name,
                    updatedServiceData.version,
                    updatedServiceData.description,
                    updatedServiceData.address,
                    updatedServiceData.type,
                ),
            ).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })

        it('should return 404 - NOT FOUND due to invalid version', async () => {
            const invalidVersion = 'v11'
            const validType = 'SUD'

            const updatedServiceData = {
                name: 'SUD Auto-punctuator Updated',
                description: 'Test description updated.',
                address: 'https://sud-speechlab.sg/second',
                type: 'NER',
                version: 'v2',
            }

            await expect(
                serviceController.updateService(
                    validType,
                    invalidVersion,
                    updatedServiceData.name,
                    updatedServiceData.version,
                    updatedServiceData.description,
                    updatedServiceData.address,
                    updatedServiceData.type,
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

            await serviceController.subscribeService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint],
            )
        })

        it('should remove service and return success message', async () => {
            const validType = 'SUD'
            const validVersion = 'v1'
            const removedMessage = await serviceController.unsubscribeService(
                validType,
                validVersion,
            )

            expect(removedMessage.message).toEqual('Service unsubscribed.')
        })

        it('should return 404 - NOT FOUND due to invalid type', async () => {
            const validVersion = 'v1'
            const invalidType = 'SUR'

            expect(serviceController.unsubscribeService(invalidType, validVersion)).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })

        it('should return 404 - NOT FOUND due to invalid version', async () => {
            const validType = 'SUD'
            const invalidVersion = 'v19'

            expect(serviceController.unsubscribeService(validType, invalidVersion)).rejects.toThrow(
                new HttpException(
                    'Service not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })

    describe('retrieve services', () => {
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
                description: 'Test description.',
                address: 'https://test2-test.com',
                type: 'SUD',
            }

            await serviceController.subscribeService(
                genesisService.name,
                genesisService.description,
                genesisService.address,
                genesisService.type,
                [genesisEndpoint],
            )

            await serviceController.subscribeService(
                secondService.name,
                secondService.description,
                secondService.address,
                secondService.type,
                [genesisEndpoint],
            )
        })

        it('should retrieve all services', async () => {
            const req = mockRequestObject()
            req.payload.role = 'admin'
            const returnedServicesAdmin = await serviceController.getServices(req)
            returnedServicesAdmin.services.every((service: Service) =>
                expect(service).toHaveProperty('address'),
            )

            req.payload.role = 'user'
            const returnedServicesUser = await serviceController.getServices(req)
            returnedServicesUser.services.every((service: Service) =>
                expect(service).not.toHaveProperty('address'),
            )
        })

        it('should retrieve service with specified type', async () => {
            const req = mockRequestObject()
            let type = 'NER'
            let returnedServices = await serviceController.getServices(req, undefined, type)
            expect(returnedServices.services.length).toEqual(0)

            type = 'SUD'
            returnedServices = await serviceController.getServices(req, undefined, type)
            expect(returnedServices.services.length).toEqual(2)
        })

        it('should retrieve service with names matching the specified name', async () => {
            const req = mockRequestObject()
            let name = '2'
            let returnedServices = await serviceController.getServices(req, name)
            expect(returnedServices.services.length).toEqual(1)

            name = 'Test'
            returnedServices = await serviceController.getServices(req, name)
            expect(returnedServices.services.length).toEqual(2)

            name = 'test'
            returnedServices = await serviceController.getServices(req, name)
            expect(returnedServices.services.length).toEqual(2)
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

            await serviceController.subscribeService(
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
            let returnedService = await serviceController.getService(req, validType, validVersion)
            expect(returnedService).toHaveProperty('name')
            expect(returnedService).toHaveProperty('description')
            expect(returnedService).toHaveProperty('type')
            expect(returnedService).toHaveProperty('version')
            expect(returnedService).toHaveProperty('address')

            req.payload.role = 'user'
            returnedService = await serviceController.getService(req, validType, validVersion)
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
                serviceController.getService(req, invalidType, validVersion),
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
                serviceController.getService(req, validType, invalidVersion),
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

            await serviceController.subscribeService(
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

            const returnedMessage = await serviceController.addEndpoint(
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
                serviceController.addEndpoint(
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
            }

            await expect(
                serviceController.addEndpoint(
                    validType,
                    validVersion,
                    endpointData.method,
                    endpointData.endpointPath,
                    endpointData.task,
                    endpointData.options,
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

            await serviceController.subscribeService(
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

            await serviceController.subscribeService(
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

            const removedMessage = await serviceController.removeEndpoint(
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
                serviceController.removeEndpoint(invalidType, invalidVersion, validTask),
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
                serviceController.removeEndpoint(validType, validVersion, invalidTask),
            ).rejects.toThrow(
                new HttpException(
                    'Endpoint not found. The requested resource could not be found.',
                    HttpStatus.NOT_FOUND,
                ),
            )
        })
    })
})
