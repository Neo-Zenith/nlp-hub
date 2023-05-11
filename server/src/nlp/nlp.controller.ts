import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { NlpService } from "./nlp.service";

@Controller('nlp')
export class NlpController {
    constructor(
        private readonly nlpService: NlpService
    ) {}
    
    // route to subscribe an NLP API to server
    @Post('register')
    subscribeNlp(
        @Body('name') apiName: string,
        @Body('version') apiVersion: string,
        @Body('endpoints') apiEndpoints: string[]
    ) {
        // calls nlpService.subscribe(...)
    }

    // route to update NLP API info (version/routes/name)
    @Post('update')
    updateNlp(
        @Body('id') apiID: string,
        @Body('name') apiName: string,
        @Body('version') apiVersion: string,
        @Body('endpoints') apiEndpoints: string[]
    ) {
        // calls nlpService.unsubscribe(id)
        // calls nlpService.subscribe(...)
    }

    // route to unsubscribe NLP API from server
    @Post('unregister')
    unsubscribeNlp(
        @Body('id') apiID: string
    ) {
        // calls nlpService.unsubscribe(id)
    }

    // route to retrieve all NLP services currently available
    @Get()
    listAllServices() {
        // calls nlpService.retrieveAll()
    }

    // route to retrieve specific NLP service
    @Get()
    getService(@Param('id') apiID: string) {
        // calls nlpService.retrieveOne()
    }
}