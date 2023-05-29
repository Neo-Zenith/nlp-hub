import { Test, TestingModule } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { ServiceController } from '../services.controller'
import { ServiceService } from '../services.service'
import { Connection, connect, Model } from 'mongoose'
import { getModelToken } from '@nestjs/mongoose'
import {
    Service,
    ServiceEndpoint,
    ServiceEndpointModel,
    ServiceEndpointSchema,
    ServiceModel,
    ServiceSchema,
} from '../services.model'
import { HttpException, HttpStatus } from '@nestjs/common'

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
            const serviceData1 = {
                name: 'SUD Auto-punctuator',
                description: 'Test description.',
                address: 'https://sud-speechlab.sg',
                type: 'SUD',
            }

            const serviceData2 = {
                name: 'SUD Auto-punctuator 2',
                description: 'Test description 2.',
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

            await serviceController.subscribeService(
                serviceData1.name,
                serviceData1.description,
                serviceData1.address,
                serviceData1.type,
                [endpointData],
            )

            await expect(
                serviceController.subscribeService(
                    serviceData2.name,
                    serviceData2.description,
                    serviceData2.address,
                    serviceData2.type,
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
                address: 'https://sud-speechlab.sg',
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
                address: 'https://sud-speechlab.sg',
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
                    'Invalid to fail. There is another endpoint of the same method and endpointPath for the specified service.',
                    HttpStatus.CONFLICT,
                ),
            )
        })
    })
})
