import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
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
import { httpExceptionSchema } from "src/custom/custom.schema";
import { queryOutputSchema, querySchema, usageResponseSchema } from "./query.schema";

@ApiTags('Queries')
@Controller('query')
export class QueryController {
    constructor(
        private readonly queryService: QueryService
    ) {}
    
    @ApiOperation({ summary: 'Utilise an NLP service.' })
    @ApiSecurity('access-token')
    @ApiBody({ schema: querySchema })
    @ApiResponse({ 
        status: 201, 
        schema: queryOutputSchema,
        description: 'Successful query. Check response for output.'
    })
    @ApiResponse({
        status: 404,
        schema: httpExceptionSchema,
        description: 'The requested service or endpoint could not be found.'
    })
    @ApiResponse({
        status: 400,
        schema: httpExceptionSchema,
        description: 'Incomplete body, or options do not match pre-defined parameters.'
    })
    @Post('')
    async query(
        @Body('serviceID') serviceID: string, 
        @Body('endpointID') endpointID: string,
        @Body('options') options: Record<string, string>,
        @Req() request: CustomRequest 
    ) { 
        const response = await this.queryService.serviceQuery(
            request.payload.id,
            serviceID,
            endpointID,
            options
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
    @ApiResponse({
        status: 200,
        description: 'Usages retrieved successfully.',
        schema: {
            properties: {
                'usages': {
                    type: 'array', 
                    description: 'Usages matching the filter (if any).',
                    items: usageResponseSchema
                }
            }
        }
    })
    @Get('')
    async getAllUsage(
        @Req() request: CustomRequest,
        @Query('type') type?: string
    ) {
        var usages;
        var obscuredUsages = [];
        if (request.payload.role === 'user') {
            usages = await this.queryService.getAllUsageForUser(request.payload.id, type);
        } else {
            usages = await this.queryService.getAllUsageForAdmin(type);
        }
        
        for (const usage of usages) {
            const modifiedUsage = {
                id: usage.id,
                userID: usage.userID,
                serviceID: usage.serviceID,
                endpointID: usage.endpointID,
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