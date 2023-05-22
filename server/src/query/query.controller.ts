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
import { httpException } from "src/custom/custom.schema";

@ApiTags('Queries')
@Controller('query')
export class QueryController {
    constructor(
        private readonly queryService: QueryService
    ) {}
    
    @ApiOperation({ summary: 'Utilise an NLP service' })
    @ApiSecurity('access-token')
    @ApiBody({
        schema: {
            properties: {
                'serviceID': { 
                    type: 'string',
                    description: 'ID of the service to utilize',
                    example: '54674867bc3fb5168347b088'
                },
                'endpointID': {
                    type: 'string',
                    description: 'ID of the endpoint of the service to call',
                    example: '54674867bc3fb5168347b088'
                },
                'options': {
                    type: 'object',
                    description: 'Option field that is required for the endpoint (Must match options registered under the endpoint)',
                    example: {
                        'option1': 'option1',
                        'option2': 'option2'
                    }
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        schema: {
            properties: {
                'id': {
                    type: 'string',
                    description: 'ID of the query',
                    example: '54674867bc3fb5168347b088'
                },
                'output': {
                    type: 'object',
                    description: 'Output from the NLP service',
                    example: {
                        'prediction': 'Output message'
                    }
                }
            }
        },
        description: 'Successful query. Check response for output.'
    })
    @ApiResponse({
        status: 404,
        schema: httpException,
        description: 'The requested service or endpoint could not be found.'
    })
    @ApiResponse({
        status: 400,
        schema: httpException,
        description: 'Incomplete body, or options do not match pre-defined parameters.'
    })
    @Post('')
    async query(@Body('serviceID') serviceID: string, 
            @Body('endpointID') endpointID: string,
            @Body('options') options: Record<string, string>,
            @Req() request: CustomRequest ) {
        
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
        description: `Filter by types of service used. Available types are ${Object.values(NlpTypes).join(' ,').toString()}`,
        example: 'SUD',
        required: false
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved all usages',
        schema: {
            properties: {
                'usages': {
                    type: 'array', 
                    description: 'Array of all usages',
                    items: {
                        type: 'object',
                        properties: {
                            'userID': {
                                type: 'string',
                                description: 'ID of the user making the query',
                                example: '54674867bc3fb5168347b088'
                            },
                            'serviceID': {
                                type: 'string',
                                description: 'ID of the service utilised',
                                example: '54674867bc3fb5168347b088'
                            },
                            'endpointID': {
                                type: 'string',
                                description: 'ID of the endpoint of the service called',
                                example: '54674867bc3fb5168347b088'
                            },
                            'dateTime': {
                                type: 'string',
                                description: 'Timestamp of the service utilised in ISO 8601 date format',
                                example: '2023-05-19T09:59:03.877Z'
                            },
                            'output': {
                                type: 'string',
                                description: 'Output is a JSON object stored as string literals',
                                example: '{\"prediction\":\"This is a test message.\"}'
                            },
                            'options': {
                                type: 'object',
                                description: 'Option field required by the endpoint',
                                example: {
                                    'option1': 'option1',
                                    'option2': 'option2'
                                }
                            }
                        }
                    }
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
                dateTime: usage.dateTime
            }

            obscuredUsages.push(modifiedUsage)
        }

        return { usages: obscuredUsages }
    }
}