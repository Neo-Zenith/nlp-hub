import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, Request } from "@nestjs/common";
import { QueryService } from "./query.service";
import { CustomRequest } from "src/custom/request/request.model";

@Controller('query')
export class QueryController {
    constructor(
        private readonly queryService: QueryService
    ) {}

    @Post()
    predict(@Body('input') input: string, 
            @Body('serviceID') serviceID: string, 
            @Body('config') config: string, 
            @Body('options') options: Record<string, string>,
            @Req() request: CustomRequest ) {
        
        const data = this.queryService.serviceRequest(
            request.payload.id,
            input,
            serviceID,
            config,
            options
        )
        return data;
    }

    @Get('config/:id') 
    async getConfig(@Param('id') serviceID: string) {
        const configs = await this.queryService.retrieveConfig(serviceID);
    }

}