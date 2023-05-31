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
    EndDateSchema,
    ExecutionTimeSchema,
    GetUsageResponseSchema,
    GetUsagesResponseSchema,
    HandleServiceEndpointRequestResponseSchema as HandleEndpointReqResponseSchema,
    HandleServiceEndpointRequestSchema as HandleEndpointReqSchema,
    ReturnDelServiceSchema,
    ReturnDelUserSchema,
    StartDateSchema,
    TaskSchema,
    TimezoneSchema,
    TypeSchema,
    UUIDSchema,
    VersionSchema,
} from './queries.schema'
import { QueryService } from './queries.service'
import {
    RegisterQueryInterceptor,
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

@ApiTags('Queries')
@Controller('query')
export class QueryController {
    constructor(private readonly queryService: QueryService) {}

    @ApiOperation({ summary: 'Queries an NLP service.' })
    @ApiConsumes('application/json', 'multipart/form-data')
    @ApiSecurity('access-token')
    @ApiParam(TypeSchema)
    @ApiParam(VersionSchema)
    @ApiParam(TaskSchema)
    @ApiBody({ type: HandleEndpointReqSchema })
    @ApiCreatedResponse({ type: HandleEndpointReqResponseSchema })
    @ApiNotFoundResponse({ type: NotFoundSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @Post(':type/:version/:task')
    @UseGuards(new UserAuthGuard(['POST']))
    @UseInterceptors(RegisterQueryInterceptor)
    async handleServiceEndpointRequest(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') task: string,
        @Body('options') options: Record<string, any>,
        @Req() request: CustomRequest,
    ): Promise<Record<string, any>> {
        const file = request.file
        const service = await this.queryService.retrieveServiceFromDB(type, version)
        const endpoint = await this.queryService.retrieveEndpointFromDB(service.id, task)
        const user = await this.queryService.retrieveUserFromDB(
            request.payload.id,
            request.payload.role,
        )

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
    @ApiParam(TypeSchema)
    @ApiParam(VersionSchema)
    @ApiQuery(ExecutionTimeSchema)
    @ApiQuery(StartDateSchema)
    @ApiQuery(EndDateSchema)
    @ApiQuery(TimezoneSchema)
    @ApiQuery(ReturnDelUserSchema)
    @ApiQuery(ReturnDelServiceSchema)
    @ApiOkResponse({ type: GetUsagesResponseSchema })
    @ApiBadRequestResponse({ type: BadRequestSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @Get('')
    @UseGuards(new UserAuthGuard(['GET']))
    @UseInterceptors(RetrieveUsagesInterceptor)
    async getUsages(
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

        return { usages: usages }
    }

    @ApiOperation({ summary: 'Retrieves a query by UUID.' })
    @ApiSecurity('access-token')
    @ApiParam(UUIDSchema)
    @ApiOkResponse({ type: GetUsageResponseSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @Get(':uuid')
    @UseGuards(new UserAuthGuard(['GET']))
    @UseInterceptors(RetrieveUsageInterceptor)
    async getUsage(@Param('uuid') uuid: string) {
        const usage = await this.queryService.getUsage(uuid)
        return usage
    }

    @ApiOperation({ summary: 'Removes a usage by UUID.' })
    @ApiSecurity('access-token')
    @ApiParam(UUIDSchema)
    @Delete(':uuid')
    @ApiOkResponse({ type: ServerMessageSchema })
    @ApiForbiddenResponse({ type: ForbiddenSchema })
    @ApiUnauthorizedResponse({ type: UnauthorizedSchema })
    @UseGuards(new UserAuthGuard(['DELETE']))
    @UseInterceptors(RetrieveUsageInterceptor)
    async removeUsage(@Param('uuid') uuid: string) {
        const message = await this.queryService.deleteUsage(uuid)
        return message
    }
}
