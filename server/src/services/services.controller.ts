import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiSecurity, ApiParam } from '@nestjs/swagger'

import {
    InsertEndpointSchema,
    InsertServiceSchema,
    UpdateEndpointSchema,
    UpdateServiceSchema,
} from './services.schema'

import { ServiceService } from './services.service'
import { HttpMethodType, ServiceType } from './services.model'
import { AdminAuthGuard, UserAuthGuard } from '../common/common.middleware'
import { CustomRequest } from '../common/request/request.model'
import {
    CreateEndpointInterceptor,
    CreateServiceInterceptor,
    UpdateEndpointInterceptor,
    UpdateServiceInterceptor,
} from './services.interceptor'

@ApiTags('Services')
@Controller('services')
export class ServiceController {
    constructor(private readonly nlpService: ServiceService) {}

    @ApiOperation({
        summary: 'Retrieves all NLP services.',
        description: 'Services are uniquely identified by their type and version.',
    })
    @ApiSecurity('access-token')
    @ApiQuery({
        name: 'name',
        description: 'Returns services with names containing the filter name.',
        example: 'Auto-punctuator',
        required: false,
    })
    @ApiQuery({
        name: 'type',
        description: `Type of service. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
        example: 'SUD',
        required: false,
    })
    @Get()
    @UseGuards(new UserAuthGuard(['GET']))
    async getServices(
        @Req() req: CustomRequest,
        @Query('name') name?: string,
        @Query('type') type?: string,
    ) {
        const services = await this.nlpService.getServices(name, type)
        const role = req.payload.role
        let obscuredServices: Record<string, any>

        if (role === 'admin') {
            obscuredServices = services.map((item) => ({
                type: item.type,
                version: item.version,
                name: item.name,
                description: item.description,
                address: item.baseAddress,
            }))
        } else {
            obscuredServices = services.map((item) => ({
                type: item.type,
                version: item.version,
                name: item.name,
                description: item.description,
            }))
        }

        return { services: obscuredServices }
    }

    @ApiOperation({ summary: 'Retrieves all service types available.' })
    @ApiSecurity('access-token')
    @Get('get-types')
    @UseGuards(new UserAuthGuard(['GET']))
    getServiceTypes() {
        const types = this.nlpService.getServiceTypes()
        return { types: types }
    }

    @ApiOperation({ summary: 'Retrieves all available version IDs under a service type.' })
    @ApiSecurity('access-token')
    @Get(':type/get-version')
    @UseGuards(new UserAuthGuard(['GET']))
    async getServiceVersion(@Param('type') type: string) {
        const versions = await this.nlpService.getServiceVersions(type)
        return { versions: versions }
    }

    @ApiOperation({
        summary: 'Retrieves a service by type and version.',
        description:
            'User provides the type and version. Returns the service with matching type and version.',
    })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'type',
        description: `Service type. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
    })
    @ApiParam({
        name: 'version',
        description:
            'Version ID under a type that uniquely identifies the service. Version must follow v{id} format.',
    })
    @Get(':type/:version')
    @UseGuards(new UserAuthGuard(['GET']))
    async getService(
        @Req() req: CustomRequest,
        @Param('type') type: string,
        @Param('version') version: string,
    ) {
        const service = await this.nlpService.getService(type, version)
        const role = req.payload.role
        let obscuredService: Record<string, any>

        if (role === 'admin') {
            obscuredService = {
                type: service.type,
                version: service.version,
                name: service.name,
                description: service.description,
                address: service.baseAddress,
            }
        } else {
            obscuredService = {
                type: service.type,
                version: service.version,
                name: service.name,
                description: service.description,
            }
        }

        return obscuredService
    }

    @ApiOperation({
        summary: 'Registers an NLP service.',
        description:
            'Admin provides the required details of a service to be registered. Address is unique to a service.',
    })
    @ApiSecurity('access-token')
    @ApiBody({ type: InsertServiceSchema })
    @Post('')
    @UseGuards(new AdminAuthGuard(['POST']))
    @UseInterceptors(CreateServiceInterceptor)
    async subscribeService(
        @Body('name') name: string,
        @Body('description') description: string,
        @Body('address') address: string,
        @Body('type') type: string,
        @Body('endpoints') endpoints: Record<string, any>[],
    ) {
        await this.nlpService.createService(name, description, address, type, endpoints)
        const response = { message: 'Service registered.' }
        return response
    }

    @ApiOperation({ summary: 'Updates an NLP service by type and version.' })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'type',
        description: `Service type. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
    })
    @ApiParam({
        name: 'version',
        description:
            'Version ID under a type that uniquely identifies the service. Version must follow v{id} format.',
    })
    @ApiBody({ type: UpdateServiceSchema })
    @Put(':type/:version')
    @UseGuards(new AdminAuthGuard(['PUT']))
    @UseInterceptors(UpdateServiceInterceptor)
    async updateService(
        @Param('type') oldType: string,
        @Param('version') oldVersion: string,
        @Body('name') name?: string,
        @Body('version') newVersion?: string,
        @Body('description') description?: string,
        @Body('address') address?: string,
        @Body('type') newType?: string,
    ) {
        const service = await this.nlpService.getService(oldType, oldVersion)
        await this.nlpService.updateService(
            service,
            name,
            newVersion,
            address,
            description,
            newType,
        )
        const response = { message: 'Service updated.' }
        return response
    }

    @ApiOperation({ summary: 'Removes an NLP service by type and version.' })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'type',
        description: `Service type. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
    })
    @ApiParam({
        name: 'version',
        description:
            'Version ID under a type that uniquely identifies the service. Version must follow v{id} format.',
    })
    @Delete(':type/:version')
    @UseGuards(new AdminAuthGuard(['DELETE']))
    async unsubscribeService(@Param('type') type: string, @Param('version') version: string) {
        await this.nlpService.removeService(type, version)
        const response = { message: 'Service unsubscribed.' }
        return response
    }

    @ApiOperation({ summary: 'Retrieves all endpoints of a service.' })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'type',
        description: `Service type. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
    })
    @ApiParam({
        name: 'version',
        description:
            'Version ID under a type that uniquely identifies the service. Version must follow v{id} format.',
    })
    @ApiQuery({
        name: 'task',
        description:
            'Task name that uniquely identifies the endpoint under the specified service. Task name is case-sensitive.',
        required: false,
    })
    @ApiQuery({
        name: 'method',
        description: `HTTP method. Available methods are '${Object.values(HttpMethodType).join(
            ', ',
        )}'.`,
        required: false,
    })
    @Get(':type/:version/endpoints')
    @UseGuards(new UserAuthGuard(['GET']))
    async getEndpoints(
        @Param('type') type: string,
        @Param('version') version: string,
        @Query('task') task?: string,
        @Query('method') method?: string,
    ) {
        const service = await this.nlpService.getService(type, version)
        const endpoints = await this.nlpService.getEndpoints(service, task, method)
        var returnData = []

        for (const endpoint of endpoints) {
            const endpointData = {
                task: endpoint.task,
                options: endpoint.options,
                method: endpoint.method,
                textBased: endpoint.textBased,
                supportedFormats: endpoint.supportedFormats,
            }

            returnData.push(endpointData)
        }

        return { endpoints: returnData }
    }

    @ApiOperation({ summary: 'Retrieves an endpoint by task name.' })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'type',
        description: `Service type. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
    })
    @ApiParam({
        name: 'version',
        description:
            'Version ID under a type that uniquely identifies the service. Version must follow v{id} format.',
    })
    @ApiParam({
        name: 'task',
        description:
            'Task name that uniquely identifies the endpoint under the specified service. Task name is case-sensitive.',
    })
    @Get(':type/:version/endpoints/:task')
    @UseGuards(new UserAuthGuard(['GET']))
    async getEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') task: string,
    ) {
        const service = await this.nlpService.getService(type, version)
        const endpoint = await this.nlpService.getEndpoint(service.id, task)

        const endpointData = {
            task: endpoint.task,
            options: endpoint.options,
            method: endpoint.method,
            textBased: endpoint.textBased,
            supportedFormats: endpoint.supportedFormats,
        }

        return endpointData
    }

    @ApiOperation({ summary: 'Adds an endpoint.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: InsertEndpointSchema })
    @Post(':type/:version/endpoints')
    @UseGuards(new AdminAuthGuard(['POST']))
    @UseInterceptors(CreateEndpointInterceptor)
    async addEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Body('method') method: string,
        @Body('endpointPath') endpointPath: string,
        @Body('task') task: string,
        @Body('options') options?: Record<string, string>,
        @Body('textBased') textBased?: boolean,
        @Body('supportedFormats') supportedFormats?: string[],
    ) {
        const service = await this.nlpService.getService(type, version)
        await this.nlpService.createEndpoint(
            service,
            endpointPath,
            method,
            task,
            options,
            textBased,
            supportedFormats,
        )
        const response = { message: 'Endpoint registered.' }
        return response
    }

    @ApiOperation({ summary: 'Updates an endpoint by task name.' })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'type',
        description: `Service type. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
    })
    @ApiParam({
        name: 'version',
        description:
            'Version ID under a type that uniquely identifies the service. Version must follow v{id} format.',
    })
    @ApiParam({
        name: 'task',
        description:
            'Task name that uniquely identifies the endpoint under the specified service. Task name is case-sensitive.',
    })
    @ApiBody({ type: UpdateEndpointSchema })
    @Put(':type/:version/endpoints/:task')
    @UseGuards(new AdminAuthGuard(['PUT']))
    @UseInterceptors(UpdateEndpointInterceptor)
    async updateEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') oldTask: string,
        @Body('method') method?: string,
        @Body('endpointPath') endpointPath?: string,
        @Body('task') newTask?: string,
        @Body('options') options?: Record<string, string>,
        @Body('supportedFormats') supportedFormats?: string[],
    ) {
        const service = await this.nlpService.getService(type, version)
        const endpoint = await this.nlpService.getEndpoint(service.id, oldTask)
        await this.nlpService.updateEndpoint(
            endpoint,
            endpointPath,
            newTask,
            endpoint.textBased ? options : undefined,
            method,
            endpoint.textBased ? undefined : supportedFormats,
        )
        const response = { message: 'Endpoint updated.' }
        return response
    }

    @ApiOperation({ summary: 'Removes an endpoint by task name.' })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'type',
        description: `Service type. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
    })
    @ApiParam({
        name: 'version',
        description:
            'Version ID under a type that uniquely identifies the service. Version must follow v{id} format.',
    })
    @ApiParam({
        name: 'task',
        description:
            'Task name that uniquely identifies the endpoint under the specified service. Task name is case-sensitive.',
    })
    @Delete(':type/:version/endpoints/:task')
    @UseGuards(new AdminAuthGuard(['DELETE']))
    async removeEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') task: string,
    ) {
        const service = await this.nlpService.getService(type, version)
        await this.nlpService.removeEndpoint(service, task)
        const response = { message: 'Endpoint deleted.' }
        return response
    }
}
