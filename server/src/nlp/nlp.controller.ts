import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { NlpService } from "./nlp.service";
import { MethodTypes, NlpEndpoint, NlpTypes } from "./nlp.model";
import { 
    ApiTags, 
    ApiOperation, 
    ApiBody, 
    ApiResponse, 
    ApiQuery, 
    ApiSecurity, 
    ApiParam 
} from "@nestjs/swagger";
import { 
    InsertEndpointSchema, 
    InsertServiceSchema, 
    RemoveEndpointSchema, 
    RemoveServiceSchema, 
    UpdateEndpointSchema, 
    UpdateServiceSchema 
} from "./nlp.schema";

@ApiTags('Services')
@Controller('services')
export class NlpController {
    constructor(
        private readonly nlpService: NlpService
    ) {}
    
    @ApiOperation({ summary: 'Registers an NLP service.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: InsertServiceSchema })
    @Post('subscribe')
    async subscribeService(
        @Body('name') name: string,
        @Body('description') description: string,
        @Body('address') address: string,
        @Body('type') type: string,
        @Body('endpoints') endpoints: NlpEndpoint[]
    ) {
        const message = await this.nlpService.addService(
            name, description, address, type, endpoints
        );
        return message;
    }

    @ApiOperation({ summary: 'Updates information of an NLP service.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: UpdateServiceSchema})
    @Post('update')
    async updateService(
        @Body('oldType') oldType: string,
        @Body('oldVersion') oldVersion: string,
        @Body('name') name?: string,
        @Body('newVersion') newVersion?: string,
        @Body('description') description?: string,
        @Body('address') address?: string,
        @Body('newType') newType?: string
    ) {
        const service = await this.nlpService.getService(oldType, oldVersion);
        const message = await this.nlpService.updateService(
            service, name, newVersion, address, description, newType
        )
        return message;
    }

    @ApiOperation({ summary: 'Removes an NLP service.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: RemoveServiceSchema })
    @Post('unsubscribe')
    async unsubscribeService(
        @Body('type') type: string,
        @Body('version') version: string
    ) {
        const response = await this.nlpService.removeService(type, version);
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
    @Get()
    async getServices(
        @Query('name') name?: string,
        @Query('type') type?: string,
    ) {
        const services = await this.nlpService.getServices(name, type);

        // Drop sensitive data like API endpoints and rename id before sending to the client
        const obscuredServices = services.map((item) => ({
            name: item.name,
            description: item.description,
            type: item.type,
            version: item.version
        }));
        return { services: obscuredServices };
    }

    @ApiOperation({ summary: 'Retrieves a service.' })
    @ApiSecurity('access-token')
    @ApiParam({ 
        name: 'type', 
        description: `Service type. Valid types are ${Object.values(NlpTypes).join(', ').toString()}.`
    })
    @ApiParam({
        name: 'version',
        description: 'Version of the service for the requested type.'
    })
    @Get(':type/:version')
    async getService(
        @Param('type') type: string,
        @Param('version') version: string
    ) {
        const service = await this.nlpService.getService(type, version);
    
        // drop sensitive data like api endpoints and rename id before sending to client
        const obscuredService = {
            name: service.name,
            description: service.description,
            type: service.type,
            version: service.version
        };

        return obscuredService
    }

    @ApiOperation({ summary: 'Retrieves all endpoints of a service.' })
    @ApiSecurity('access-token')
    @ApiParam({ 
        name: 'type', 
        description: `Service type. Valid types are ${Object.values(NlpTypes).join(', ').toString()}.`
    })
    @ApiParam({
        name: 'version',
        description: 'Version of the service for the requested type.'
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
    @Get(':type/:version/endpoints')
    async getEndpoints(
        @Param('type') type: string,
        @Param('version') version: string,
        @Query('task') task?: string,
        @Query('method') method?: string,
    ) {
        const service = await this.nlpService.getService(type, version);
        const endpoints = await this.nlpService
            .getEndpoints(service, task, method);
        var returnData = []

        for (const endpoint of endpoints) {
            const endpointData = {
                task: endpoint.task,
                options: endpoint.options,
                method: endpoint.method
            }

            returnData.push(endpointData)
        }

        return { endpoints: returnData };
    }

    @ApiOperation({ summary: "Retrieves an endpoint." })
    @ApiParam({ 
        name: 'type', 
        description: `Service type. Valid types are ${Object.values(NlpTypes).join(', ').toString()}.`
    })
    @ApiParam({
        name: 'version',
        description: 'Version of the service for the requested type.'
    })
    @ApiParam({ 
        name: 'task',
        description: 'Task associated with the endpoint for the requested service.'
    })
    @Get(':type/:version/:task') 
    async getEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') task: string
    ) {
        const service = await this.nlpService.getService(type, version);
        const endpoint = await this.nlpService.getEndpoint(service.id, task);

        const endpointData = {
            task: endpoint.task,
            options: endpoint.options,
            method: endpoint.method
        }

        return endpointData;
    }

    @ApiOperation({ summary: 'Adds an endpoint.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: InsertEndpointSchema })
    @Post(':type/:version/endpoints/add')
    async addEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Body('method') method: string,
        @Body('endpointPath') endpointPath: string,
        @Body('task') task: string,
        @Body('options') options: Record<string, string>
    ) {
        const service = await this.nlpService.getService(type, version);
        const message = await this.nlpService.addEndpoint(
            service, endpointPath, method, task, options
        )
        return message;
    }

    @ApiOperation({ summary: 'Removes an endpoint.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: RemoveEndpointSchema })
    @Post(':type/:version/endpoints/remove')
    async removeEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Body('task') task: string
    ) {
        const service = await this.nlpService.getService(type, version);
        const message = await this.nlpService.removeEndpoint(service, task);
        return message;
    }

    @ApiOperation({ summary: 'Updates information of an endpoint' })
    @ApiSecurity('access-token')
    @ApiBody({ type: UpdateEndpointSchema })
    @Post(':type/:version/endpoints/update') 
    async updateEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Body('oldTask') oldTask: string,
        @Body('method') method?: string,
        @Body('endpointPath') endpointPath?: string,
        @Body('newTask') newTask?: string,
        @Body('options') options?: Record<string, string>
    ) {
        const service = await this.nlpService.getService(type, version);
        const endpoint = await this.nlpService.getEndpoint(service.id, oldTask);
        const message = await this.nlpService.updateEndpoint(
            endpoint, endpointPath, newTask, options, method
        )
        return message;
    }
}