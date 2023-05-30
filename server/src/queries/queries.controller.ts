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

import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiSecurity, ApiParam } from '@nestjs/swagger'

import { ServiceQuerySchema } from './queries.schema'
import { QueryService } from './queries.service'
import {
    RegisterQueryInterceptor,
    RetrieveUsageInterceptor,
    RetrieveUsagesInterceptor,
} from './queries.interceptor'
import { CustomRequest } from '../common/request/request.model'
import { UserAuthGuard } from '../common/common.middleware'
import { ServiceType } from '../services/services.model'

@ApiTags('Queries')
@Controller('query')
export class QueryController {
    constructor(private readonly queryService: QueryService) {}

    @ApiOperation({
        summary: 'Queries an NLP service.',
        description:
            'User indicates the desired service (by type and version) as well as the endpoint (by task) to call. User is also responsible in providing options, if required by the endpoint.',
    })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'type',
        description: `Type of service. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
        example: 'SUD',
    })
    @ApiParam({
        name: 'version',
        description:
            'Version ID under a type that uniquely identifies the service. Version must follow v{id} format.',
        example: 'v10',
    })
    @ApiParam({
        name: 'task',
        description:
            'Task name that uniquely identifies the endpoint under the specified service. Task name is case-sensitive.',
        example: 'predict',
    })
    @ApiBody({ type: ServiceQuerySchema })
    @Post(':type/:version/:task')
    @UseGuards(new UserAuthGuard(['POST']))
    @UseInterceptors(RegisterQueryInterceptor)
    async serviceQuery(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') task: string,
        @Body('options') options: Record<string, any>,
        @Req() request: CustomRequest,
    ): Promise<Record<string, any>> {
        const service = await this.queryService.retrieveService(type, version)
        const endpoint = await this.queryService.retrieveEndpoint(service.id, task)
        const user = await this.queryService.retrieveUser(request.payload.id, request.payload.role)
        const response = await this.queryService.serviceQuery(user, service, endpoint, options)
        return response
    }
}

@ApiTags('Queries')
@Controller('usages')
export class UsageController {
    constructor(private readonly queryService: QueryService) {}

    @ApiOperation({
        summary: 'Retrieves usages, subjected to the provided filters (if any).',
        description:
            'All queries will be returned for admins, whereas only queries made by the user will be returned for a user (provided no additional filters are given).',
    })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'type',
        description: `Type of service. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
        example: 'SUD',
    })
    @ApiParam({
        name: 'version',
        description:
            'Version ID under a type that uniquely identifies the service. Version must follow v{id} format.',
        example: 'v10',
    })
    @ApiQuery({
        name: 'executionTime',
        description:
            'Returns all queries with execution time at most the specified time length (in seconds). Execution time is measured by time taken between querying the service and receiving a response.',
        example: 1,
        required: false,
    })
    @ApiQuery({
        name: 'startDate',
        description:
            'Start of the range of dates when the query was made. Queries made no earlier than this date will be returned. startDate must follow YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS format. If time is not provided, defaults to 00:00:00 of the specified day.',
        example: '2022-12-01',
        required: false,
    })
    @ApiQuery({
        name: 'endDate',
        description:
            'End of the range of dates when the query was made. Queries made no later than this date will be returned. startDate must follow YYYY-MM-DD format or YYYY-MM-DDTHH:MM:SS format. If time is not provided, defaults to 23:59:59 of the specified day.',
        example: '2022-12-31',
        required: false,
    })
    @ApiQuery({
        name: 'timezone',
        description:
            'Integer indicating the timezone of the user. If not provided, the timezone defaults to UTC+0.',
        example: '4',
        required: false,
    })
    @ApiQuery({
        name: 'returnDelUser',
        description: 'Indicate if result should include queries made by users who no longer exist.',
        example: true,
        required: false,
    })
    @ApiQuery({
        name: 'returnDelService',
        description:
            'Indicate if result should include queries made on services which have been unregistered.',
        example: true,
        required: false,
    })
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
        let obscuredUsages = []
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

        for (const usage of usages) {
            const modifiedUsage = {
                uuid: usage.uuid,
                executionTime: usage.executionTime,
                output: usage.output,
                options: usage.options,
                dateTime: usage.dateTime,
                serviceDeleted: usage.serviceDeleted,
                userDeleted: usage.userDeleted,
            }
            obscuredUsages.push(modifiedUsage)
        }

        return { usages: obscuredUsages }
    }

    @ApiOperation({
        summary: 'Retrieves a query by UUID.',
        description:
            'User provides the UUID of the query to be returned. User will only be able access the query details of a query made by the user, whereas admins are able to view all query details without this restriction.',
    })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'uuid',
        description: 'UUID of the query to be returned.',
        example: '0ba81115-4f52-23b8-bc07-11e77a932e4f',
    })
    @Get(':uuid')
    @UseGuards(new UserAuthGuard(['GET']))
    @UseInterceptors(RetrieveUsageInterceptor)
    async getUsage(@Param('uuid') uuid: string) {
        const usage = await this.queryService.getUsage(uuid)
        const obscuredUsage = {
            output: usage.output,
            options: usage.options,
            executionTime: usage.executionTime,
            dateTime: usage.dateTime,
            serviceDeleted: usage.serviceDeleted,
            userDeleted: usage.userDeleted,
        }
        return obscuredUsage
    }

    @ApiOperation({
        summary: 'Removes a usage by UUID.',
        description:
            'User provides the UUID of the query to be removed. User will only be able to remove queries made by the user, whereas admins are able to remove queries without this restriction.',
    })
    @ApiSecurity('access-token')
    @ApiParam({
        name: 'uuid',
        description: 'UUID of the query to be removed.',
        example: '0ba81115-4f52-23b8-bc07-11e77a932e4f',
    })
    @Delete(':uuid')
    @UseGuards(new UserAuthGuard(['DELETE']))
    @UseInterceptors(RetrieveUsageInterceptor)
    async removeUsage(@Param('uuid') uuid: string) {
        const message = await this.queryService.deleteUsage(uuid)
        return message
    }
}
