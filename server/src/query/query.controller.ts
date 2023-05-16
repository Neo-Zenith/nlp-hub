import { Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { QueryService } from "./query.service";

@Controller('query')
export class QueryController {
    constructor(
        private readonly queryService: QueryService
    ) {}

    @Post()
    predict(input: string, serviceID: string, config: string, options: Record<string, string>) {
    }

    @Get('config/:id') 
    async getConfig(@Param('id') serviceID: string) {
        const configs = await this.queryService.retrieveConfig(serviceID);
        var tasks = []

        if (! configs) {
            throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
        }

        for (const config of configs) {
            tasks.push(config.task);
        } 

        return {payload: tasks}
    }

}