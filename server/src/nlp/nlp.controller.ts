import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { NlpService } from "./nlp.service";
import { MethodTypes, NlpEndpoint, NlpTypes } from "./nlp.model";
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery, ApiSecurity } from "@nestjs/swagger";

@ApiTags('Services')
@Controller('services')
export class NlpController {
    constructor(
        private readonly nlpService: NlpService
    ) {}
    
    @ApiOperation({ summary: 'Adds an NLP service to the server' })
    @ApiSecurity('access-token')
    @ApiBody({
        schema: {
            properties: {
                'name': { 
                    type: 'string', 
                    description: 'Name of the service',
                    example: 'SUD Auto-punctuator' },
                'version': { 
                    type: 'string', 
                    description: 'Version of the service',
                    example: '1.0' },
                'description': { 
                    type: 'string', 
                    description: 'Description of the service',
                    example: 'This service auto-punctuates English sentences' },
                'address': { 
                    type: 'string', 
                    description: 'IP address/URL of the service (include port number if necessary)',
                    example: '192.168.0.1:3000' },
                'type': { 
                    type: 'string', 
                    description: `Valid types are: ${Object.values(NlpTypes).join(', ').toString()}`,
                    example: 'SUD' },
                'endpoints': { 
                    type: 'array', 
                    description: 'Array of endpoints provided by the service',
                    items: {
                        type: 'object',
                        properties: {
                            'method': { 
                                type: 'string',
                                description: `HTTP method of the endpoint. Valid methods are: ${Object.values(MethodTypes).join(', ').toString()}`, 
                                example: 'POST' },
                            'endpointPath': { 
                                type: 'string', 
                                description: 'Endpoint path for the endpoint, must include a leading backslash',
                                example: '/predict'},
                            'options': { 
                                type: 'object', 
                                description: 'Option fields for the endpoint. Key-value pair must be in the form <option, type>',
                                example: {
                                    'option1': 'string',
                                    'option2': 'boolean'
                                } }
                        }
                    }
                }
            }
        }
     })
    @ApiResponse({ status: 201, description: 'The service is successfully registered.'})
    @ApiResponse({ status: 409, description: 'The service already exist (duplicated address).'})
    @ApiResponse({ status: 400, description: 'Incomplete body.'})
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

    @ApiOperation({ summary: 'Updates information of an NLP service' })
    @ApiSecurity('access-token')
    @ApiBody({
        schema: {
            properties: {
                'id': { 
                    type: 'string',
                    description: 'ID of the service to be updated', 
                    example: '5467443817296ad01d46a430'},
                'name': { 
                    type: 'string', 
                    description: 'Name of the service',
                    example: 'SUD Auto-punctuator' },
                'version': { 
                    type: 'string', 
                    description: 'Version of the service',
                    example: '1.0' },
                'description': { 
                    type: 'string', 
                    description: 'Description of the service',
                    example: 'This service auto-punctuates English sentences' },
                'address': { 
                    type: 'string', 
                    description: 'IP address/URL of the service (include port number if necessary)',
                    example: '192.168.0.1:3000' },
                'type': { 
                    type: 'string', 
                    description: `Valid types are: ${Object.values(NlpTypes).join(', ').toString()}`,
                    example: 'SUD' },
                'endpoints': { 
                    type: 'array', 
                    description: 'Array of endpoints provided by the service',
                    items: {
                        type: 'object',
                        properties: {
                            'method': { 
                                type: 'string',
                                description: `HTTP method of the endpoint. Valid methods are: ${Object.values(MethodTypes).join(', ').toString()}`, 
                                example: 'POST' },
                            'endpointPath': { 
                                type: 'string', 
                                description: 'Endpoint path for the endpoint, must include a leading backslash',
                                example: '/predict'},
                            'options': { 
                                type: 'object', 
                                description: 'Option fields for the endpoint. Key-value pair must be in the form <option, type>',
                                example: {
                                    'option1': 'string',
                                    'option2': 'boolean'
                                } }
                        }
                    }
                }
            }
        }
     })
    @ApiResponse({ status: 404, description: 'The requested service could not be found.'})
    @ApiResponse({ status: 400, description: 'Invalid service ID format, or incomplete body.'})
    @ApiResponse({ status: 201, description: 'The service is successfully updated.'})
    @ApiResponse({ status: 409, description: 'The service already exist (duplicated address).'})
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

    @ApiOperation({ summary: 'Removes an NLP service from the server' })
    @ApiSecurity('access-token')
    @ApiBody({
        schema: {
            properties: {
                'id': { 
                    type: 'string', 
                    description: 'ID of the service to be removed',
                    example: '5467443817296ad01d46a430'}
            }
        }
    })
    @ApiResponse({ status: 404, description: 'The requested service could not be found.'})
    @ApiResponse({ status: 400, description: 'Invalid service ID format.'})
    @ApiResponse({ status: 201, description: 'The service is successfully updated.'})
    @Post('unsubscribe')
    async unsubscribeNlp(
        @Body('id') serviceID: string
    ) {
        const response = await this.nlpService.unsubscribe(serviceID);
        return response;
    }

    @ApiOperation({ summary: 'Retrieves all NLP services' })
    @ApiSecurity('access-token')
    @ApiQuery({ 
        name: 'name', 
        description: 'Name of the service (includes substring matches but case-sensitive)', 
        required: false })
    @ApiQuery({ 
        name: 'type', 
        description: `Type of the service. Valid types are ${Object.values(NlpTypes).join(', ').toString()}`, 
        required: false })
    @ApiResponse({ status: 200, description: 'Successful retrieval of services.'})
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

    @ApiOperation({ summary: 'Retrieves a service' })
    @ApiSecurity('access-token')
    @ApiQuery({ 
        name: 'id', 
        description: 'ID of the service to be retrieved' })
    @ApiResponse({ status: 200, description: 'Successful retrieval of service.'})
    @ApiResponse({ status: 400, description: 'Invalid service ID format.'})
    @ApiResponse({ status: 404, description: 'The requested service could not be found.'})
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

    @ApiOperation({ summary: 'Retrieves all endpoints of a service' })
    @ApiSecurity('access-token')
    @ApiQuery({ 
        name: 'id', 
        description: 'Endpoints assoicated with this ID will be retrieved' })
    @ApiQuery({ 
        name: 'task',
        description: 'Task associated with the endpoint',
        required: false })
    @ApiQuery({ 
        name: 'method',
        description: `HTTP method of the endpoint. Valid methods are ${Object.values(MethodTypes).join(', ').toString()}`,
        required: false })
    @ApiResponse({ status: 200, description: 'Successful retrieval of endpoints.'})
    @ApiResponse({ status: 404, description: 'The requested service could not be found.'})
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

@ApiTags('Service endpoints')
@Controller('endpoints')
export class EndpointController {
    constructor(
        private readonly nlpService: NlpService
    ) {}
    
    @ApiOperation({ summary: "Retrieves all endpoints" })
    @ApiQuery({ 
        name: 'task',
        description: 'Task associated with the endpoint',
        required: false })
    @ApiQuery({ 
        name: 'method',
        description: `HTTP method of the endpoint. Valid methods are ${Object.values(MethodTypes).join(', ').toString()}`,
        required: false })
    @ApiResponse({ status: 200, description: 'Successful retrieval of endpoints.'})
    @ApiResponse({ status: 500, description: 'Some endpoints have no associated services.'})
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

    @ApiOperation({ summary: 'Retrieves an endpoint' })
    @ApiQuery({ 
        name: 'id',
        description: 'ID of the endpoint to be retrieved' })
    @ApiResponse({ status: 200, description: 'Successful retrieval of an endpoint.'})
    @ApiResponse({ status: 404, description: 'The requested endpoint could not be found.'})
    @ApiResponse({ status: 400, description: 'Invalid endpoint ID format.'})
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

    @ApiOperation({ summary: 'Adds an endpoint to the server' })
    @ApiBody({
        schema: {
            properties: {
                'serviceID': { 
                    type: 'string', 
                    description: 'ID of the service to be associated with this endpoint',
                    example: '5467443817296ad01d46a430' },
                'method': { 
                    type: 'string',
                    description: `HTTP methods of the endpoint. Valid methods are ${Object.values(MethodTypes).join(', ').toString()}`, 
                    example: 'POST' },
                'endpointPath': { 
                    type: 'string', 
                    description: 'Endpoint path for the endpoint, must include a leading backslash',
                    example: '/predict'},
                'options': { 
                    type: 'object', 
                    description: 'Option fields for the endpoint. Key-value pair must be in the form <option, type>',
                    example: {
                        'option1': 'string',
                        'option2': 'boolean'
                    } }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'The endpoint is successfully added to the server.'})
    @ApiResponse({ status: 400, description: 'Invalid service ID format, or incomplete body.'})
    @ApiResponse({ status: 409, description: 'Task for the service, or endpoint for the service of the given method already exist.'})
    @ApiResponse({ status: 404, description: 'The requested service could not be found.'})
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

    @ApiOperation({ summary: 'Removes an endpoint from the server' })
    @ApiBody({
        schema: {
            properties: {
                'id': { 
                    type: 'string', 
                    description: 'ID of the endpoint to be removed',
                    example: '5467443817296ad01d46a430' }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'The endpoint is successfully removed to the server.'})
    @ApiResponse({ status: 400, description: 'Invalid endpoint ID format.'})
    @ApiResponse({ status: 404, description: 'The requested endpoint could not be found.'})
    @Post('remove')
    async removeEndpoint(
        @Body('id') endpointID: string
    ) {
        const message = await this.nlpService.removeEndpoint(endpointID);
        return message;
    }

    @ApiOperation({ summary: 'Updates information of an endpoint' })
    @ApiBody({
        schema: {
            properties: {
                'id': {
                    type: 'string',
                    description: 'ID of the endpoint to be updated',
                    example: '5467443817296ad01d46a430'
                },
                'serviceID': { 
                    type: 'string', 
                    description: 'ID of the service to be associated with this endpoint',
                    example: '5467443817296ad01d46a430' },
                'method': { 
                    type: 'string',
                    description: `HTTP methods of the endpoint. Valid methods are ${Object.values(MethodTypes).join(', ').toString()}`, 
                    example: 'POST' },
                'endpointPath': { 
                    type: 'string', 
                    description: 'Endpoint path for the endpoint, must include a leading backslash',
                    example: '/predict'},
                'options': { 
                    type: 'object', 
                    description: 'Option fields for the endpoint. Key-value pair must be in the form <option, type>',
                    example: {
                        'option1': 'string',
                        'option2': 'boolean'
                    } }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'The endpoint is successfully updated.'})
    @ApiResponse({ status: 400, description: 'Invalid service ID format, invalid endpoint ID format, or incomplete body.'})
    @ApiResponse({ status: 409, description: 'Task for the service, or endpoint for the service of the given method already exist.'})
    @ApiResponse({ status: 404, description: 'The requested service or endpoint could not be found.'})
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