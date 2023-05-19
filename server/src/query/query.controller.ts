import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { QueryService } from "./query.service";
import { CustomRequest } from "src/custom/request/request.model";

@Controller('query')
export class QueryController {
    constructor(
        private readonly queryService: QueryService
    ) {}

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

@Controller('usages')
export class UsageController {
    constructor(
        private readonly queryService: QueryService
    ) {}

    @Get('')
    async getAllUsage(@Req() request: CustomRequest) {
        var usages;
        var obscuredUsages = [];

        if (request.payload.role === 'user') {
            usages = await this.queryService.getAllUsageForUser(request.payload.id);
        } else {
            usages = await this.queryService.getAllUsageForAdmin();
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