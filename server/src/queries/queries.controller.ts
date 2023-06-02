import {
    Body,
    Controller,
    Get,
    Post,
    Delete,
    Query,
    Req,
    Param,
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
    ApiConsumes,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiCreatedResponse,
} from '@nestjs/swagger'

import {
    RetrieveUsageResponseSchema,
    RetrieveUsagesResponseSchema,
    HandleEndpointReqResponseSchema,
    HandleEndpointReqSchema,
    RetrieveUsageSchema,
    RetrieveUsagesSchema,
} from './queries.schema'
import { QueryService } from './queries.service'
import {
    CreateQueryInterceptor,
    RetrieveUsageInterceptor,
    RetrieveUsagesInterceptor,
} from './queries.interceptor'

import { CustomRequest } from '../common/request/request.model'
import { UserAuthGuard } from '../common/common.middleware'
import {
    BadRequestSchema,
    ForbiddenSchema,
    NotFoundSchema,
    ServerMessageSchema,
    UnauthorizedSchema,
} from '../common/common.schema'
import { UserService } from '../users/users.service'
import { ServiceService } from '../services/services.service'
import { RetrieveEndpointSchema, RetrieveServiceSchema } from '../services/services.schema'

@ApiTags('Queries')
@Controller('query')
export class QueryController {
    constructor(
        private readonly queryService: QueryService,
        private readonly userService: UserService,
        private readonly serviceService: ServiceService,
    ) {}

    @ApiOperation({ summary: 'Queries an NLP service.' })
    @ApiConsumes('application/json', 'multipart/form-data')
    @ApiSecurity('access-token')
    @ApiParam(RetrieveServiceSchema.type)
    @ApiParam(RetrieveServiceSchema.version)
    @ApiParam(RetrieveEndpointSchema.task)
    @ApiBody({ type: HandleEndpointReqSchema })
    @ApiCreatedResponse({ type: HandleEndpointReqResponseSchema })
    @ApiNotFoundResponse({ type: NotFoundSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @Post(':type/:version/:task')
    @UseGuards(new UserAuthGuard(['POST']))
    @UseInterceptors(CreateQueryInterceptor)
    async handleServiceEndpointRequest(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') task: string,
        @Body('options') options: Record<string, any>,
        @Req() request: CustomRequest,
    ): Promise<Record<string, any>> {
        const file = request.file
        const role = request.payload.role
        const userID = request.payload.id
        const service = await this.serviceService.getService(type, version)
        const endpoint = await this.serviceService.getEndpoint(service.id, task)
        const user =
            role === 'admin'
                ? await this.userService.getAdmin(undefined, undefined, userID)
                : await this.userService.getUser(undefined, undefined, userID)

        let response: Record<string, any>

        if (!endpoint.textBased) {
            response = await this.queryService.handleUploadableQuery(user, service, endpoint, file)
        } else {
            response = await this.queryService.handleTextQuery(user, service, endpoint, options)
        }

        return response
    }
}

@ApiTags('Queries')
@Controller('usages')
export class UsageController {
    constructor(private readonly queryService: QueryService) {}

    @ApiOperation({ summary: 'Retrieves usages.' })
    @ApiSecurity('access-token')
    @ApiQuery(RetrieveUsagesSchema.type)
    @ApiQuery(RetrieveUsagesSchema.version)
    @ApiQuery(RetrieveUsagesSchema.timezone)
    @ApiQuery(RetrieveUsagesSchema.startDate)
    @ApiQuery(RetrieveUsagesSchema.endDate)
    @ApiQuery(RetrieveUsagesSchema.executionTime)
    @ApiQuery(RetrieveUsagesSchema.returnDelService)
    @ApiQuery(RetrieveUsagesSchema.returnDelUser)
    @ApiOkResponse({ type: RetrieveUsagesResponseSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @Get('')
    @UseGuards(new UserAuthGuard(['GET']))
    @UseInterceptors(RetrieveUsagesInterceptor)
    async retrieveUsages(
        @Req() request: CustomRequest,
        @Query('type') type?: string,
        @Query('version') version?: string,
        @Query('executionTime') execTime?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('timezone') timezone?: string,
        @Query('returnDelUser') returnDelUser?: boolean,
        @Query('returnDelService') returnDelService?: boolean,
    ): Promise<Record<string, any>> {
        const role = request.payload.role
        const userID = request.payload.id
        const usages = await this.queryService.getUsages(
            userID,
            role,
            type,
            version,
            execTime,
            startDate,
            endDate,
            timezone,
            returnDelUser,
            returnDelService,
        )

        let returnedUsages = []

        for (const usage of usages) {
            const usageDetails = {
                uuid: usage.uuid,
                executionTime: usage.executionTime,
                output: usage.output,
                options: usage.options,
                dateTime: this.queryService.convertTimezone(usage.dateTime, timezone),
                ...(usage.userDeleted && { userDeleted: usage.userDeleted }),
                ...(usage.serviceDeleted && { serviceDeleted: usage.serviceDeleted }),
            }
            returnedUsages.push(usageDetails)
        }
        return { usages: returnedUsages }
    }

    @ApiOperation({ summary: 'Retrieves a query by UUID.' })
    @ApiSecurity('access-token')
    @ApiParam(RetrieveUsageSchema.uuid)
    @ApiOkResponse({ type: RetrieveUsageResponseSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @Get(':uuid')
    @UseGuards(new UserAuthGuard(['GET']))
    @UseInterceptors(RetrieveUsageInterceptor)
    async getUsage(@Param('uuid') uuid: string, @Query('timezone') timezone?: string) {
        const usage = await this.queryService.getUsage(uuid)
        const usageDetails = {
            uuid: usage.uuid,
            executionTime: usage.executionTime,
            output: usage.output,
            options: usage.options,
            dateTime: this.queryService.convertTimezone(usage.dateTime, timezone),
            ...(usage.userDeleted && { userDeleted: usage.userDeleted }),
            ...(usage.serviceDeleted && { serviceDeleted: usage.serviceDeleted }),
        }
        return usageDetails
    }

    @ApiOperation({ summary: 'Removes a usage by UUID.' })
    @ApiSecurity('access-token')
    @ApiParam(RetrieveUsageSchema.uuid)
    @Delete(':uuid')
    @ApiOkResponse({ type: ServerMessageSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @UseGuards(new UserAuthGuard(['DELETE']))
    @UseInterceptors(RetrieveUsageInterceptor)
    async removeUsage(@Param('uuid') uuid: string) {
        await this.queryService.deleteUsage(uuid)
        const response = { message: 'Usage deleted.' }
        return response
    }
}
