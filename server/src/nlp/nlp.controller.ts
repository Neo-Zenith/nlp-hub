import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { NlpService } from "./nlp.service";
import { NlpEndpoint } from "./nlp.model";

@Controller('services')
export class NlpController {
    constructor(
        private readonly nlpService: NlpService
    ) {}
    

    @Post('subscribe')
    async subscribeNlp(
        @Body('name') serviceName: string,
        @Body('version') serviceVersion: string,
        @Body('description') serviceDesc: string,
        @Body('address') serviceAddr: string,
        @Body('type') serviceType: string,
        @Body('endpoints') serviceEndpoints: NlpEndpoint[]
    ) {
        const serviceID = await this.nlpService.subscribe(
            serviceName,
            serviceVersion,
            serviceDesc,
            serviceAddr,
            serviceType,
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
        @Body('type') serviceType: string,
        @Body('endpoints') serviceEndpoints: NlpEndpoint[]
    ) {
        await this.nlpService.unsubscribe(serviceID);
        const newID = await this.nlpService.subscribe(
            serviceName,
            serviceVersion,
            serviceDesc,
            serviceAddr,
            serviceType,
            serviceEndpoints
        )

        return { id: newID }
    }


    @Post('unsubscribe')
    async unsubscribeNlp(
        @Body('id') serviceID: string
    ) {
        const response = await this.nlpService.unsubscribe(serviceID);
        return response;
    }


    @Get()
    async listAllServices(
        @Query('name') name?: string,
        @Query('type') type?: string,
    ) {
        const services = await this.nlpService.retrieveAllServices(name, type);

        // Drop sensitive data like API endpoints and rename id before sending to the client
        const obscuredServices = services.map((item) => ({
            id: item._id,
            name: item.name,
            version: item.version,
            description: item.description,
            type: item.type
        }));
        return { services: obscuredServices };
    }


    @Get(':id')
    async getService(@Param('id') serviceID: string) {
        const service = await this.nlpService.retrieveOneService(serviceID);
    
        // drop sensitive data like api endpoints and rename id before sending to client
        const obscuredService = {
            id: service._id,
            name: service.name,
            version: service.version,
            description: service.description,
            type: service.type
        };

        return obscuredService
    }

    @Get(':id/endpoints')
    async getServiceEndpoint(
        @Param('id') serviceID: string,
        @Query('task') task?: string,
        @Query('method') method?: string,
    ) {
        const endpoints = await this.nlpService
                            .retrieveEndpointsForOneService(serviceID, task, method);
        var returnData = []

        for (const endpoint of endpoints) {
            const endpointData = {
                id: endpoint._id,
                task: endpoint.task,
                options: endpoint.options,
                method: endpoint.method
            }

            returnData.push(endpointData)
        }

        return { endpoints: returnData };
    }

}

@Controller('endpoints')
export class EndpointController {
    constructor(
        private readonly nlpService: NlpService
    ) {}

    @Get()
    async listAllEndpoints(
        @Query('method') method?: string,
        @Query('task') task?: string
    ) {
        const endpoints = await this.nlpService.retrieveAllEndpoints(task, method);
        const services = await this.nlpService.retrieveAllServices();
        var returnData = []

        for (const endpoint of endpoints) {
            const service = services.find((s) => s.id === endpoint.serviceID);
            if (! service) {
                throw new HttpException(
                    "Foreign key constraint failed", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const endpointData = {
                id: endpoint._id,
                serviceID: service._id,
                method: endpoint.method,
                task: endpoint.task,
                options: endpoint.options
            }

            returnData.push(endpointData)
        }
        return { endpoints: returnData };
    }

    
    @Get(':id')
    async getEndpoint(@Param('id') endpointID: string) {
        const endpoint = await this.nlpService.retrieveOneEndpoint(endpointID);
        const service = await this.nlpService.retrieveOneService(endpoint.serviceID)
        
        // drop sensitive data like api endpoints and rename id before sending to client
        const endpointData = {
            id: service._id,
            serviceID: service._id,
            method: endpoint.method,
            task: endpoint.task,
            options: endpoint.options
        }

        return endpointData;
    }

    @Post('add')
    async addEndpoint(
        @Body('serviceID') serviceID: string,
        @Body('method') method: string,
        @Body('endpointPath') endpointPath: string,
        @Body('task') task: string,
        @Body('options') options: Record<string, string>
    ) {
        const endpointID = await this.nlpService.addEndpoint(
            serviceID, endpointPath, method, task, options
        )

        return { id: endpointID }
    }

    @Post('remove')
    async removeEndpoint(
        @Body('id') endpointID: string
    ) {
        const message = await this.nlpService.removeEndpoint(endpointID);
        return message;
    }

    @Post('update') 
    async updateEndpoint(
        @Body('id') endpointID: string,
        @Body('serviceID') serviceID: string,
        @Body('method') method: string,
        @Body('endpointPath') endpointPath: string,
        @Body('task') task: string,
        @Body('options') options: Record<string, string>
    ) {
        await this.nlpService.removeEndpoint(endpointID);
        const newEndpointID = await this.nlpService.addEndpoint(
            serviceID, endpointPath, method, task, options
        )

        return { id: newEndpointID }
    }
}