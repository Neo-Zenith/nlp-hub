import { Controller, Post } from "@nestjs/common";
import { QueryService } from "./query.service";

@Controller('query')
export class QueryController {
    constructor(
        private readonly queryService: QueryService
    ) {}

    @Post()
    predict(input: string, serviceID: string, options: Record<string, string>) {

    }
}