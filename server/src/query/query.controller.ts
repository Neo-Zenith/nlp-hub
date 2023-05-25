import { Body, Controller, Get, Post, Delete, Query, Req, Param, UseGuards, UseInterceptors } from "@nestjs/common";
import { QueryService } from "./query.service";
import { CustomRequest } from "src/custom/request/request.model";
import { 
    ApiTags, 
    ApiOperation, 
    ApiBody, 
    ApiResponse, 
    ApiQuery, 
    ApiSecurity
} from "@nestjs/swagger";
import { NlpTypes } from "src/nlp/nlp.model";
import { ServiceQuerySchema } from "./query.schema";
import { UserAuthGuard } from "src/custom/custom.middleware";
import { RegisterQueryInterceptor, RetrieveUsageInterceptor } from "./query.middleware";

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
    
    @ApiOperation({ summary: 'Retrieves all usages of the user/everyone (for admins).'})
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
    @Get('')
    @UseGuards(new UserAuthGuard(['GET']))
    async getUsages(
        @Req() request: CustomRequest,
        @Query('type') type?: string,
        @Query('version') version?: string
    ) {
        var obscuredUsages = [];
        const role = request.payload.role;
        const userID = request.payload.id;
        const usages = await this.queryService.getUsages(userID, role, type, version);
        
        for (const usage of usages) {
            const modifiedUsage = {
                uuid: usage.uuid,
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