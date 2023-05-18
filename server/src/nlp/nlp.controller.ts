import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { NlpService } from "./nlp.service";
import { NlpEndpoint } from "./nlp.model";

@Controller('nlp')
export class NlpController {
    constructor(
        private readonly nlpService: NlpService
    ) {}
    

    @Post('register')
    async subscribeNlp(
        @Body('name') serviceName: string,
        @Body('version') serviceVersion: string,
        @Body('description') serviceDesc: string,
        @Body('address') serviceAddr: string,
        @Body('endpoints') serviceEndpoints: NlpEndpoint[]
    ) {
        const serviceID = await this.nlpService.subscribe(
            serviceName,
            serviceVersion,
            serviceDesc,
            serviceAddr,
            serviceEndpoints);
        return { id: serviceID };
    }


    @Post('update')
    async updateNlp(
        @Body('id') serviceID: string,
        @Body('name') serviceName: string,
        @Body('version') serviceVersion: string,
        @Body('description') serviceDesc: string,
        @Body('address') serviceAddr: string,
        @Body('endpoints') serviceEndpoints: NlpEndpoint[]
    ) {
        const deleted = await this.nlpService.unsubscribe(serviceID);
        if (! deleted) {
            throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
        }
        const newID = await this.nlpService.subscribe(
            serviceName,
            serviceVersion,
            serviceDesc,
            serviceAddr,
            serviceEndpoints
        )

        return { id: newID }
    }


    @Post('unregister')
    async unsubscribeNlp(
        @Body('id') serviceID: string
    ) {
        const response = await this.nlpService.unsubscribe(serviceID);
        return response;
    }


    @Get('services')
    async listAllServices() {
        const services = await this.nlpService.retrieveAllServices();
        
        // drop sensitive data like api endpoints and rename id before sending to client
        const obscuredServices = services.map((item) => ({
            id: item._id,
            name: item.name,
            version: item.version,
            description: item.description
        }));
        return { services: obscuredServices };
    }


    @Get('services/:id')
    async getService(@Param('id') serviceID: string) {
        const service = await this.nlpService.retrieveOneService(serviceID);
    
        // drop sensitive data like api endpoints and rename id before sending to client
        const obscuredService = {
            id: service._id,
            name: service.name,
            version: service.version,
            description: service.description
        };

        return obscuredService
    }


    @Get('endpoints')
    async listAllEndpoints() {
        const endpoints = await this.nlpService.retrieveAllEndpoints();
        const services = await this.nlpService.retrieveAllServices();
        var returnData = []

        for (const endpoint of endpoints) {
            const service = services.find((s) => s._id === endpoint.serviceID);
            if (! service) {
                throw new HttpException(
                    "Foreign key constraint failed", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const endpointData = {
                id: endpoint._id,
                serviceName: service.name,
                serviceVersion: service.version,
                serviceDescription: service.description,
                serviceAddress: service.address,
                endpoint: endpoint.endpoint,
                method: endpoint.method,
                options: endpoint.options
            }

            returnData.push(endpointData)
        }
        return returnData;
    }

    
    @Get('endpoints/:id')
    async getEndpoint(@Param('id') endpointID: string) {
        const endpoint = await this.nlpService.retrieveOneEndpoint(endpointID);
        const service = await this.nlpService.retrieveOneService(endpoint.serviceID)
        
        // drop sensitive data like api endpoints and rename id before sending to client
        const endpointData = {
            id: service._id,
            serviceName: service.name,
            serviceVersion: service.version,
            serviceDescription: service.description,
            serviceAddress: service.address,
            endpoint: endpoint.endpoint,
            method: endpoint.method,
            options: endpoint.options
        }

        return endpointData;
    }


    @Get('services/:id/endpoints')
    async getServiceEndpoint(@Param('id') serviceID: string) {
        const service = await this.nlpService.retrieveOneService(serviceID);
        const endpoints = await this.nlpService.retrieveEndpointsForOneService(serviceID);
        var returnData = []

        for (const endpoint of endpoints) {
            const endpointData = {
                id: endpoint._id,
                serviceName: service.name,
                serviceVersion: service.version,
                serviceDescription: service.description,
                serviceAddress: service.address,
                endpoint: endpoint.endpoint,
                options: endpoint.options,
                method: endpoint.method
            }

            returnData.push(endpointData)
        }

        return returnData;
    }
}