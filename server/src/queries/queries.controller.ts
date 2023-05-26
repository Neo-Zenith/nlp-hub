import { 
    Body, Controller, Get, Post, Delete, Query, Req, 
    Param, UseGuards, UseInterceptors 
} from "@nestjs/common";
import { 
    ApiTags, ApiOperation, ApiBody, ApiQuery, ApiSecurity
} from "@nestjs/swagger";
import { ServiceQuerySchema } from "./queries.schema";
import { QueryService } from "./queries.service";
import { 
    RegisterQueryInterceptor, RetrieveUsageInterceptor, RetrieveUsagesInterceptor 
} from "./queries.interceptor";
import { CustomRequest } from "../custom/request/request.model";
import { UserAuthGuard } from "../custom/custom.middleware";
import { NlpTypes } from "../services/services.model";


@ApiTags('Queries')
@Controller('query')
export class QueryController {
    constructor(
        private readonly queryService: QueryService
    ) {}
    
    @ApiOperation({ summary: 'Utilise an NLP service.' })
    @ApiSecurity('access-token')
    @ApiBody({ type: ServiceQuerySchema })
    @Post(':type/:version/:task')
    @UseGuards(new UserAuthGuard(['POST']))
    @UseInterceptors(RegisterQueryInterceptor)
    async serviceQuery(
        @Param('type') type: string,
        @Param('version') version: string,
        @Param('task') task: string,
        @Body('options') options: Record<string, string>,
        @Req() request: CustomRequest 
    ) { 
        const service = await this.queryService.retrieveService(type, version);
        const endpoint = await this.queryService.retrieveEndpoint(service.id, task);
        const user = await this.queryService.retrieveUser(request.payload.id);
        const response = await this.queryService.serviceQuery(
            user, service, endpoint, options
        )
        return response;
    }
}

@ApiTags('Queries')
@Controller('usages')
export class UsageController {
    constructor(
        private readonly queryService: QueryService
    ) {}
    
    @ApiOperation({ 
        summary: 'Retrieves all usages of the user/everyone (for admins).'
    })
    @ApiSecurity('access-token')
    @ApiQuery({
        name: 'type',
        description: `Service type. Available types are ${Object.values(NlpTypes).join(', ').toString()}.`,
        example: 'SUD',
        required: false
    })
    @ApiQuery({
        name: 'version',
        description: 'Unique identifier for a service. Version must follow v{id} format.',
        example: 'v11',
        required: false
    })
    @ApiQuery({
        name: 'executionTime',
        description: 'Execution time in seconds. Usages with execution time at most this number will be returned.',
        example: 1,
        required: false
    })
    @ApiQuery({
        name: 'startDate',
        description: 'Start of the range of dates when the query was made. Usages with dateTime no earlier than this date will be returned. startDate must follow YYYY-MM-DD format.',
        example: '2022-12-01',
        required: false
    })
    @ApiQuery({
        name: 'endDate',
        description: 'End of the range of dates when the query was made. Usages with dateTime no later than this date will be returned. startDate must follow YYYY-MM-DD format.',
        example: '2022-12-01',
        required: false
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
        @Query('endDate') endDate?: string
    ) {
        var obscuredUsages = [];
        const role = request.payload.role;
        const userID = request.payload.id;
        const usages = await this.queryService.getUsages(
            userID, role, type, version, execTime, startDate, endDate
        );
        
        for (const usage of usages) {
            const modifiedUsage = {
                uuid: usage.uuid,
                executionTime: usage.executionTime,
                output: usage.output,
                options: usage.options,
                dateTime: usage.dateTime,
                serviceDeleteed: usage.deleted
            }
            obscuredUsages.push(modifiedUsage)
        }

        return { usages: obscuredUsages }
    }

    @ApiOperation({ summary: "Retrieves a usage" })
    @ApiSecurity('access-token')
    @Get(":uuid")
    @UseGuards(new UserAuthGuard(['GET']))
    @UseInterceptors(RetrieveUsageInterceptor)
    async getUsage(
        @Param('uuid') uuid: string
    ) {
        const usage = await this.queryService.getUsage(uuid);
        const obscuredUsage = {
            output: usage.output,
            options: usage.options,
            dateTime: usage.dateTime,
            serviceDeleteed: usage.deleted
        }
        return obscuredUsage;
    }

    @ApiOperation({ summary: "Removes a usage" })
    @ApiSecurity('access-token')
    @Delete(":uuid")
    @UseGuards(new UserAuthGuard(['DELETE']))
    @UseInterceptors(RetrieveUsageInterceptor)
    async removeUsage(
        @Param('uuid') uuid: string
    ) {
        const message = await this.queryService.deleteUsage(uuid);
        return message;
    }
}