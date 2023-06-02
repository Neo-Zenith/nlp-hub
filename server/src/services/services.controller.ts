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
import {
    ApiTags,
    ApiOperation,
    ApiBody,
    ApiQuery,
    ApiSecurity,
    ApiParam,
    ApiOkResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiUnauthorizedResponse,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiConflictResponse,
} from '@nestjs/swagger'

import {
    CreateEndpointSchema,
    CreateServiceSchema,
    RetrieveEndpointResponseSchema,
    RetrieveEndpointSchema,
    RetrieveEndpointsResponseSchema,
    RetrieveEndpointsSchema,
    RetrieveServiceResponseSchema,
    RetrieveServiceSchema,
    RetrieveServiceTypesResponseSchema,
    RetrieveServiceVersionResponseSchema,
    RetrieveServiceVersionSchema,
    RetrieveServicesResponseSchema,
    RetrieveServicesSchema,
    UpdateEndpointSchema,
    UpdateServiceSchema,
} from './services.schema'

import { ServiceService } from './services.service'
import { AdminAuthGuard, UserAuthGuard } from '../common/common.middleware'
import { CustomRequest } from '../common/request/request.model'
import {
    CreateEndpointInterceptor,
    CreateServiceInterceptor,
    UpdateEndpointInterceptor,
    UpdateServiceInterceptor,
} from './services.interceptor'
import {
    BadRequestSchema,
    ConflictSchema,
    ForbiddenSchema,
    NotFoundSchema,
    ServerMessageSchema,
    UnauthorizedSchema,
} from '../common/common.schema'

@ApiTags('Services')
@Controller('services')
export class ServiceController {
    constructor(private readonly serviceService: ServiceService) {}

    @ApiOperation({ summary: 'Retrieves all NLP services.' })
    @ApiSecurity('access-token')
    @ApiQuery(RetrieveServicesSchema.name)
    @ApiQuery(RetrieveServicesSchema.type)
    @ApiOkResponse({ type: RetrieveServicesResponseSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @Get()
    @UseGuards(new UserAuthGuard(['GET']))
    async retrieveServices(
        @Req() req: CustomRequest,
        @Query('name') name?: string,
        @Query('type') type?: string,
    ) {
        const services = await this.serviceService.getServices(name, type)
        const role = req.payload.role
        const servicesDetails = services.map((item) => ({
            type: item.type,
            version: item.version,
            name: item.name,
            description: item.description,
            ...(role === 'admin' && { address: item.baseAddress }),
        }))

        return { services: servicesDetails }
    }

    @ApiOperation({ summary: 'Retrieves all service types.' })
    @ApiSecurity('access-token')
    @ApiOkResponse({ type: RetrieveServiceTypesResponseSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @Get('get-types')
    @UseGuards(new UserAuthGuard(['GET']))
    retrieveServiceTypes() {
        const types = this.serviceService.getServiceTypes()
        return { types: types }
    }

    @ApiOperation({ summary: 'Retrieves all version IDs for a service type.' })
    @ApiSecurity('access-token')
    @ApiParam(RetrieveServiceVersionSchema.type)
    @ApiOkResponse({ type: RetrieveServiceVersionResponseSchema })
    @ApiNotFoundResponse({ type: NotFoundSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @Get(':type/get-version')
    @UseGuards(new UserAuthGuard(['GET']))
    async retrieveServiceVersion(@Param('type') type: string) {
        const versions = await this.serviceService.getServiceVersions(type)
        return { versions: versions }
    }

    @ApiOperation({ summary: 'Retrieves a service by type and version.' })
    @ApiSecurity('access-token')
    @ApiParam(RetrieveServiceSchema.type)
    @ApiParam(RetrieveServiceSchema.version)
    @ApiOkResponse({ type: RetrieveServiceResponseSchema })
    @ApiNotFoundResponse({ type: NotFoundSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @Get(':type/:version')
    @UseGuards(new UserAuthGuard(['GET']))
    async getService(
        @Req() req: CustomRequest,
        @Param('type') type: string,
        @Param('version') version: string,
    ) {
        const service = await this.serviceService.getService(type, version)
        const role = req.payload.role

        const serviceDetails = {
            type: service.type,
            version: service.version,
            name: service.name,
            description: service.description,
            ...(role === 'admin' && { address: service.baseAddress }),
        }

        return serviceDetails
    }

    @ApiOperation({ summary: 'Registers an NLP service.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: CreateServiceSchema })
    @ApiCreatedResponse({ type: ServerMessageSchema })
    @ApiConflictResponse({ type: ConflictSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @Post('')
    @UseGuards(new AdminAuthGuard(['POST']))
    @UseInterceptors(CreateServiceInterceptor)
    async createService(
        @Body('name') name: string,
        @Body('description') description: string,
        @Body('address') address: string,
        @Body('type') type: string,
        @Body('endpoints') endpoints: Record<string, any>[],
    ) {
        await this.serviceService.createService(name, description, address, type, endpoints)
        const response = { message: 'Service registered.' }
        return response
    }

    @ApiOperation({ summary: 'Updates an NLP service by type and version.' })
    @ApiSecurity('access-token')
    @ApiParam(RetrieveServiceSchema.type)
    @ApiParam(RetrieveServiceSchema.version)
    @ApiBody({ type: UpdateServiceSchema })
    @ApiOkResponse({ type: ServerMessageSchema })
    @ApiConflictResponse({ type: ConflictSchema })
    @ApiNotFoundResponse({ type: NotFoundSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
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
        const service = await this.serviceService.getService(oldType, oldVersion)
        await this.serviceService.updateService(
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
    @ApiParam(RetrieveServiceSchema.type)
    @ApiParam(RetrieveServiceSchema.version)
    @ApiOkResponse({ type: ServerMessageSchema })
    @ApiNotFoundResponse({ type: NotFoundSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @Delete(':type/:version')
    @UseGuards(new AdminAuthGuard(['DELETE']))
    async deleteService(@Param('type') type: string, @Param('version') version: string) {
        await this.serviceService.removeService(type, version)
        const response = { message: 'Service unsubscribed.' }
        return response
    }

    @ApiOperation({ summary: 'Retrieves all endpoints of a service.' })
    @ApiSecurity('access-token')
    @ApiParam(RetrieveServiceSchema.type)
    @ApiParam(RetrieveServiceSchema.version)
    @ApiQuery(RetrieveEndpointsSchema.method)
    @ApiQuery(RetrieveEndpointsSchema.task)
    @ApiOkResponse({ type: RetrieveEndpointsResponseSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiNotFoundResponse({ type: NotFoundSchema })
    @Get(':type/:version/endpoints')
    @UseGuards(new UserAuthGuard(['GET']))
    async getEndpoints(
        @Param('type') type: string,
        @Param('version') version: string,
        @Query('task') task?: string,
        @Query('method') method?: string,
    ) {
        const service = await this.serviceService.getService(type, version)
        const endpoints = await this.serviceService.getEndpoints(service, task, method)
        var returnData = []

        for (const endpoint of endpoints) {
            const endpointData = {
                task: endpoint.task,
                ...(endpoint.textBased && { options: endpoint.options }),
                method: endpoint.method,
                textBased: endpoint.textBased,
                ...(endpoint.textBased && { supportedFormats: endpoint.supportedFormats }),
            }

            returnData.push(endpointData)
        }

        return { endpoints: returnData }
    }

    @ApiOperation({ summary: 'Retrieves an endpoint by task name.' })
    @ApiSecurity('access-token')
    @ApiParam(RetrieveServiceSchema.type)
    @ApiParam(RetrieveServiceSchema.version)
    @ApiParam(RetrieveEndpointSchema.task)
    @ApiOkResponse({ type: RetrieveEndpointResponseSchema })
    @ApiNotFoundResponse({ type: NotFoundSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @Get(':type/:version/endpoints/:task')
    @UseGuards(new UserAuthGuard(['GET']))
    async retrieveEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') task: string,
    ) {
        const service = await this.serviceService.getService(type, version)
        const endpoint = await this.serviceService.getEndpoint(service.id, task)

        const endpointData = {
            task: endpoint.task,
            ...(endpoint.textBased && { options: endpoint.options }),
            method: endpoint.method,
            textBased: endpoint.textBased,
            ...(endpoint.textBased && { supportedFormats: endpoint.supportedFormats }),
        }

        return endpointData
    }

    @ApiOperation({ summary: 'Registers an endpoint.' })
    @ApiSecurity('access-token')
    @ApiParam(RetrieveServiceSchema.type)
    @ApiParam(RetrieveServiceSchema.version)
    @ApiBody({ type: CreateEndpointSchema })
    @ApiCreatedResponse({ type: ServerMessageSchema })
    @ApiConflictResponse({ type: ConflictSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiNotFoundResponse({ type: NotFoundSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @Post(':type/:version/endpoints')
    @UseGuards(new AdminAuthGuard(['POST']))
    @UseInterceptors(CreateEndpointInterceptor)
    async createEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Body('method') method: string,
        @Body('endpointPath') endpointPath: string,
        @Body('task') task: string,
        @Body('options') options?: Record<string, string>,
        @Body('textBased') textBased?: boolean,
        @Body('supportedFormats') supportedFormats?: string[],
    ) {
        const service = await this.serviceService.getService(type, version)
        await this.serviceService.createEndpoint(
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
    @ApiParam(RetrieveServiceSchema.type)
    @ApiParam(RetrieveServiceSchema.version)
    @ApiParam(RetrieveEndpointSchema.task)
    @ApiBody({ type: UpdateEndpointSchema })
    @ApiOkResponse({ type: ServerMessageSchema })
    @ApiConflictResponse({ type: ConflictSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiNotFoundResponse({ type: NotFoundSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
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
        const service = await this.serviceService.getService(type, version)
        const endpoint = await this.serviceService.getEndpoint(service.id, oldTask)
        await this.serviceService.updateEndpoint(
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
    @ApiParam(RetrieveServiceSchema.type)
    @ApiParam(RetrieveServiceSchema.version)
    @ApiParam(RetrieveEndpointSchema.task)
    @ApiOkResponse({ type: ServerMessageSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiNotFoundResponse({ type: NotFoundSchema })
    @Delete(':type/:version/endpoints/:task')
    @UseGuards(new AdminAuthGuard(['DELETE']))
    async deleteEndpoint(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') task: string,
    ) {
        const service = await this.serviceService.getService(type, version)
        await this.serviceService.removeEndpoint(service, task)
        const response = { message: 'Endpoint deleted.' }
        return response
    }
}
