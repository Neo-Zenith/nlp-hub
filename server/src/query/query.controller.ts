import { Controller, Post } from "@nestjs/common";
import { QueryService } from "./query.service";

@Controller('query')
export class QueryController {
    constructor(
        private readonly queryService: QueryService
    ) {}

    /**
     * Route for connecting client with NLP API endpoints
     * CLients send in data, indicate options and which API to use, server forwards package
     * @param input Input text to be passed over to the API
     * @param serviceID ID of the API to be utilised
     * @param options Options selected by the user
     */
    @Post()
    predict(input: string, serviceID: string, options: Record<string, string>) {
        // retrieve Nlp service object
        // parse endpoints
        // cross-check options matches (maybe link query's options to NLP's options as FK?)
        // determine HTTP method (from parse endpoints)
        // send over data
        // receive response
        // parse response
        // send data to client
    }
}