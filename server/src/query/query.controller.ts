import { Body, Controller, Get, Post, Query, Req, Param } from "@nestjs/common";
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
    @Get('')
    async getUsages(
        @Req() request: CustomRequest,
        @Query('type') type?: string
    ) {
        var obscuredUsages = [];
        const role = request.payload.role;
        const userID = request.payload.id;
        const usages = await this.queryService.getUsages(userID, role, type);
        
        for (const usage of usages) {
            const modifiedUsage = {
                id: usage.id,
                output: usage.output,
                options: usage.options,
                dateTime: usage.dateTime,
                serviceDeleteed: usage.deleted
            }

            obscuredUsages.push(modifiedUsage)
        }

        return { usages: obscuredUsages }
    }
}