import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { NlpService } from "./nlp.service";
import { MethodTypes, NlpEndpoint, NlpTypes } from "./nlp.model";
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery, ApiSecurity, ApiParam } from "@nestjs/swagger";
import { IDRequestSchema, IDResponseSchema, httpExceptionSchema, serverMessageResponseSchema } from "src/custom/custom.schema";
import { addEndpointSchema, endpointResponseSchema, insertServiceSchema, serviceResponseSchema, updateEndpointSchema, updateServiceSchema } from "./nlp.schema";

@ApiTags('Services')
@Controller('services')
export class NlpController {
    constructor(
        private readonly nlpService: NlpService
    ) {}
    
    @ApiOperation({ summary: 'Registers an NLP service.' })
    @ApiSecurity('access-token')
    @ApiBody({ schema: insertServiceSchema })
    @ApiResponse({ 
        status: 201, 
        schema: IDResponseSchema,
        description: 'Service registered successfully.'
    })
    @ApiResponse({ 
        status: 409, 
        schema: httpExceptionSchema,
        description: 'Service of the same address already exist within the database.'
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Incomplete body.'
    })
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
            serviceEndpoints
        );
        return { id: serviceID };
    }

    @ApiOperation({ summary: 'Updates information of an NLP service.' })
    @ApiSecurity('access-token')
    @ApiBody({ schema: updateServiceSchema })
    @ApiResponse({ 
        status: 404, 
        schema: httpExceptionSchema,
        description: 'The requested service could not be found.'
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Invalid service ID format, or incomplete body.'
    })
    @ApiResponse({ 
        status: 201, 
        schema: serverMessageResponseSchema,
        description: 'Service information updated successfully.'
    })
    @ApiResponse({ 
        status: 409, 
        schema: httpExceptionSchema,
        description: 'Another service with the updated address already exist in the database.'
    })
    @Post('update')
    async updateNlp(
        @Body('id') serviceID: string,
        @Body('name') serviceName?: string,
        @Body('version') serviceVersion?: string,
        @Body('description') serviceDesc?: string,
        @Body('address') serviceAddr?: string,
        @Body('type') serviceType?: string
    ) {
        
        const message = await this.nlpService.updateService(
            serviceID, serviceName, serviceVersion, serviceAddr, serviceDesc, serviceType
        )
        return message;
    }

    @ApiOperation({ summary: 'Removes an NLP service.' })
    @ApiSecurity('access-token')
    @ApiBody({ schema: IDRequestSchema })
    @ApiResponse({ 
        status: 404, 
        schema: httpExceptionSchema,
        description: 'The requested service could not be found.'
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Invalid service ID format.'
    })
    @ApiResponse({ 
        status: 201, 
        schema: serverMessageResponseSchema,
        description: 'Service deleted successfully.'
    })
    @Post('unsubscribe')
    async unsubscribeNlp(
        @Body('id') serviceID: string
    ) {
        const response = await this.nlpService.unsubscribe(serviceID);
        return response;
    }

    @ApiOperation({ summary: 'Retrieves all NLP services.' })
    @ApiSecurity('access-token')
    @ApiQuery({ 
        name: 'name', 
        description: 'Name of the service. Returns results with names containing the filter name.', 
        required: false 
    })
    @ApiQuery({ 
        name: 'type', 
        description: `Service type. Valid types are ${Object.values(NlpTypes).join(', ').toString()}.`, 
        required: false 
    })
    @ApiResponse({ 
        status: 200, 
        schema: {
            properties: {
                'services': {
                    type: 'array',
                    description: 'Services matching the filters (if any).',
                    items: serviceResponseSchema
                }
            }
        },
        description: 'Services retrieved successfully.'
    })
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

    @ApiOperation({ summary: 'Retrieves a service.' })
    @ApiSecurity('access-token')
    @ApiParam({ 
        name: 'id', 
        description: 'ID must be a valid 12-byte string.'
    })
    @ApiResponse({ 
        status: 200, 
        schema: serviceResponseSchema,
        description: 'Service retrieved successfully.'
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Invalid service ID format.'})
    @ApiResponse({ 
        status: 404, 
        schema: httpExceptionSchema,
        description: 'The requested service could not be found.'
    })
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

    @ApiOperation({ summary: 'Retrieves all endpoints of a service.' })
    @ApiSecurity('access-token')
    @ApiParam({ 
        name: 'id', 
        description: 'ID of the service. ID must be a valid 12-byte string.',
    })
    @ApiQuery({ 
        name: 'task',
        description: 'Task associated with the endpoint for the requested service.',
        required: false 
    })
    @ApiQuery({ 
        name: 'method',
        description: `HTTP method. Valid methods are ${Object.values(MethodTypes).join(', ').toString()}.`,
        required: false 
    })
    @ApiResponse({ 
        status: 200, 
        schema: {
            type: 'array',
            items: endpointResponseSchema
        },
        description: 'Endpoints retrieved successfully.'
    })
    @ApiResponse({ 
        status: 404, 
        schema: httpExceptionSchema,
        description: 'The requested service could not be found.'
    })
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
                serviceID: serviceID,
                task: endpoint.task,
                options: endpoint.options,
                method: endpoint.method
            }

            returnData.push(endpointData)
        }

        return { endpoints: returnData };
    }
}

@ApiTags('Endpoints')
@Controller('endpoints')
export class EndpointController {
    constructor(
        private readonly nlpService: NlpService
    ) {}
    
    @ApiOperation({ summary: "Retrieves all endpoints." })
    @ApiSecurity('access-token')
    @ApiQuery({ 
        name: 'task',
        description: 'Task associated with the endpoint.',
        required: false 
    })
    @ApiQuery({ 
        name: 'method',
        description: `HTTP method. Valid methods are ${Object.values(MethodTypes).join(', ').toString()}`,
        required: false 
    })
    @ApiResponse({ 
        status: 200, 
        schema: {
            type: 'array',
            items: endpointResponseSchema
        },
        description: 'Endpoints retrieved successfully.'
    })
    @ApiResponse({ 
        status: 500, 
        schema: httpExceptionSchema,
        description: 'Some endpoints have no associated services.'
    })
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

    @ApiOperation({ summary: 'Retrieves an endpoint.' })
    @ApiSecurity('access-token')
    @ApiParam({ 
        name: 'id',
        description: 'ID must be a valid 12-byte string.',
    })
    @ApiResponse({ 
        status: 200, 
        schema: endpointResponseSchema,
        description: 'Endpoint retrieved successfully.'
    })
    @ApiResponse({ 
        status: 404, 
        schema: httpExceptionSchema,
        description: 'The requested endpoint could not be found.'
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Invalid endpoint ID format.'
    })
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

    @ApiOperation({ summary: 'Adds an endpoint.' })
    @ApiSecurity('access-token')
    @ApiBody({ schema: addEndpointSchema })
    @ApiResponse({ 
        status: 201, 
        schema: IDRequestSchema,
        description: 'Endpoint added successfully.'
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Invalid service ID format, or incomplete body.'
    })
    @ApiResponse({ 
        status: 409, 
        schema: httpExceptionSchema,
        description: 'Task for the service, or endpoint for the service of the given method already exist.'
    })
    @ApiResponse({ 
        status: 404,
        schema: httpExceptionSchema,
        description: 'The requested service could not be found.'
    })
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

    @ApiOperation({ summary: 'Removes an endpoint.' })
    @ApiSecurity('access-token')
    @ApiBody({ schema: IDRequestSchema })
    @ApiResponse({ 
        status: 201, 
        schema: serverMessageResponseSchema,
        description: 'Endpoint removed successfully.'
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Invalid endpoint ID format.'})
    @ApiResponse({ 
        status: 404, 
        schema: httpExceptionSchema,
        description: 'The requested endpoint could not be found.'
    })
    @Post('remove')
    async removeEndpoint(
        @Body('id') endpointID: string
    ) {
        const message = await this.nlpService.removeEndpoint(endpointID);
        return message;
    }

    @ApiOperation({ summary: 'Updates information of an endpoint' })
    @ApiSecurity('access-token')
    @ApiBody({ schema: updateEndpointSchema })
    @ApiResponse({ 
        status: 201, 
        schema: IDResponseSchema,
        description: 'Endpoint updated successfully.'
    })
    @ApiResponse({ 
        status: 400, 
        schema: httpExceptionSchema,
        description: 'Invalid service ID format, invalid endpoint ID format, or incomplete body.'
    })
    @ApiResponse({ 
        status: 409,
        schema: httpExceptionSchema, 
        description: 'Task for the service, or endpoint for the service of the given method already exist.'
    })
    @ApiResponse({ 
        status: 404, 
        schema: httpExceptionSchema,
        description: 'The requested service or endpoint could not be found.'
    })
    @Post('update') 
    async updateEndpoint(
        @Body('id') endpointID: string,
        @Body('serviceID') serviceID?: string,
        @Body('method') method?: string,
        @Body('endpointPath') endpointPath?: string,
        @Body('task') task?: string,
        @Body('options') options?: Record<string, string>
    ) {
        const message = await this.nlpService.updateEndpoint(
            endpointID, serviceID, endpointPath, task, options, method
        )
        return message;
    }
}