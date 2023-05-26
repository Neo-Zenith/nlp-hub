import { 
    Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards 
} from "@nestjs/common";
import { ServiceService } from "./services.service";
import { HttpMethodType, ServiceEndpoint, ServiceType } from "./services.model";
import { 
    ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery, ApiSecurity, ApiParam 
} from "@nestjs/swagger";
import { 
    InsertEndpointSchema, InsertServiceSchema, UpdateEndpointSchema, 
    UpdateServiceSchema 
} from "./services.schema";
import { AdminAuthGuard, UserAuthGuard } from "src/common/common.middleware";

@ApiTags('Services')
@Controller('services')
export class ServiceController {
    constructor(
        private readonly nlpService: ServiceService
    ) {}

    @ApiOperation({ summary: 'Retrieves all NLP services.' })
    @ApiSecurity('access-token')
    @ApiQuery({ 
        name: 'name', 
        description: 'Name of the service. Returns results with names containing the filter name.', 
        required: false 
    })
    @ApiQuery({ 
        name: 'type', 
        description: `Service type. Valid types are ${Object.values(ServiceType).join(', ').toString()}.`, 
        required: false 
    })
    @Get()
    @UseGuards(new UserAuthGuard(['GET']))
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

    @ApiOperation({ summary: 'Retrieves all service types available.' })
    @ApiSecurity('access-token')
    @Get('get-types')
    @UseGuards(new UserAuthGuard(['GET']))
    getServiceTypes() {
        const types = this.nlpService.getServiceTypes();
        return { types: types }
    }

    @ApiOperation({ summary: 'Retrieves all versions under a service type.' })
    @ApiSecurity('access-token')
    @Get(':type/get-version')
    @UseGuards(new UserAuthGuard(['GET']))
    async getServiceVersion(
        @Param('type') type: string
    ) {
        const versions = await this.nlpService.getServiceVersions(type);
        return { versions: versions }
    }

    @ApiOperation({ summary: 'Retrieves a service.' })
    @ApiSecurity('access-token')
    @ApiParam({ 
        name: 'type', 
        description: `Service type. Valid types are ${Object.values(ServiceType).join(', ').toString()}.`
    })
    @ApiParam({
        name: 'version',
        description: 'Version of the service for the requested type.'
    })
    @Get(':type/:version')
    @UseGuards(new UserAuthGuard(['GET']))
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
    
    @ApiOperation({ summary: 'Registers an NLP service.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: InsertServiceSchema })
    @Post('')
    @UseGuards(new AdminAuthGuard(['POST']))
    async subscribeService(
        @Body('name') name: string,
        @Body('description') description: string,
        @Body('address') address: string,
        @Body('type') type: string,
        @Body('endpoints') endpoints: ServiceEndpoint[]
    ) {
        const message = await this.nlpService.addService(
            name, description, address, type, endpoints
        );
        return message;
    }

    @ApiOperation({ summary: 'Updates information of an NLP service.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: UpdateServiceSchema})
    @Put(':type/:version')
    @UseGuards(new AdminAuthGuard(['PUT']))
    async updateService(
        @Param('type') oldType: string,
        @Param('version') oldVersion: string,
        @Body('name') name?: string,
        @Body('version') newVersion?: string,
        @Body('description') description?: string,
        @Body('address') address?: string,
        @Body('type') newType?: string
    ) {
        const service = await this.nlpService.getService(oldType, oldVersion);
        const message = await this.nlpService.updateService(
            service, name, newVersion, address, description, newType
        )
        return message;
    }

    @ApiOperation({ summary: 'Removes an NLP service.' })
    @ApiSecurity('access-token')
    @Delete(':type/:version')
    @UseGuards(new AdminAuthGuard(['DELETE']))
    async unsubscribeService(
        @Param('type') type: string,
        @Param('version') version: string
    ) {
        const response = await this.nlpService.removeService(type, version);
        return response;
    }

    @ApiOperation({ summary: 'Retrieves all endpoints of a service.' })
    @ApiSecurity('access-token')
    @ApiParam({ 
        name: 'type', 
        description: `Service type. Valid types are ${Object.values(ServiceType).join(', ').toString()}.`
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
        description: `HTTP method. Valid methods are ${Object.values(HttpMethodType).join(', ').toString()}.`,
        required: false 
    })
    @Get(':type/:version/endpoints')
    @UseGuards(new UserAuthGuard(['GET']))
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
    @ApiSecurity('access-token')
    @ApiParam({ 
        name: 'type', 
        description: `Service type. Valid types are ${Object.values(ServiceType).join(', ').toString()}.`
    })
    @ApiParam({
        name: 'version',
        description: 'Version of the service for the requested type.'
    })
    @ApiParam({ 
        name: 'task',
        description: 'Task associated with the endpoint for the requested service.'
    })
    @Get(':type/:version/endpoints/:task') 
    @UseGuards(new UserAuthGuard(['GET']))
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
    @Post(':type/:version/endpoints')
    @UseGuards(new AdminAuthGuard(['POST']))
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

    @ApiOperation({ summary: 'Updates information of an endpoint' })
    @ApiSecurity('access-token')
    @ApiBody({ type: UpdateEndpointSchema })
    @Put(':type/:version/endpoints/:task') 
    @UseGuards(new AdminAuthGuard(['PUT']))
    async updateEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') oldTask: string,
        @Body('method') method?: string,
        @Body('endpointPath') endpointPath?: string,
        @Body('task') newTask?: string,
        @Body('options') options?: Record<string, string>
    ) {
        const service = await this.nlpService.getService(type, version);
        const endpoint = await this.nlpService.getEndpoint(service.id, oldTask);
        const message = await this.nlpService.updateEndpoint(
            endpoint, endpointPath, newTask, options, method
        )
        return message;
    }

    @ApiOperation({ summary: 'Removes an endpoint.' })
    @ApiSecurity('access-token')
    @Delete(':type/:version/endpoints/:task')
    @UseGuards(new AdminAuthGuard(['DELETE']))
    async removeEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') task: string
    ) {
        const service = await this.nlpService.getService(type, version);
        const message = await this.nlpService.removeEndpoint(service, task);
        return message;
    }
}