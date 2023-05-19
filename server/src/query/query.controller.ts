import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { QueryService } from "./query.service";
import { CustomRequest } from "src/custom/request/request.model";

@Controller('query')
export class QueryController {
    constructor(
        private readonly queryService: QueryService
    ) {}

    @Post('submit')
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

    @Get('usage')
    async getAllUsage(@Req() request: CustomRequest) {
        if (request.payload.role === 'user') {
            const usages = await this.queryService.getAllUsageForUser(request.payload.id);
            return {
                usage: usages
            }
        } else {
            const usages = await this.queryService.getAllUsageForAdmin();
            return {
                usage: usages
            }
        }
    }
}