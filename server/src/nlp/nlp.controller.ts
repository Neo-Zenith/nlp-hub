import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { NlpService } from "./nlp.service";

@Controller('nlp')
export class NlpController {
    constructor(
        private readonly nlpService: NlpService
    ) {}
    
    // route to subscribe an NLP API to server
    @Post('register')
    async subscribeNlp(
        @Body('name') apiName: string,
        @Body('version') apiVersion: string,
        @Body('description') apiDesc: string,
        @Body('endpoints') apiEndpoints: string[]
    ) {
        const apiID = await this.nlpService.subscribe(
            apiName,
            apiVersion,
            apiDesc,
            apiEndpoints);
        return {id: apiID};
    }

    // route to update NLP API info (version/routes/name)
    @Post('update')
    async updateNlp(
        @Body('id') apiID: string,
        @Body('name') apiName: string,
        @Body('version') apiVersion: string,
        @Body('description') apiDesc: string,
        @Body('endpoints') apiEndpoints: string[]
    ) {
        const data = await this.nlpService.unsubscribe(apiID);
        const newID = await this.nlpService.subscribe(
            apiName,
            apiVersion,
            apiDesc,
            apiEndpoints
        )
        return ({
            oldAPIStatus: data,
            newID: newID
        })
    }

    // route to unsubscribe NLP API from server
    @Post('unregister')
    async unsubscribeNlp(
        @Body('id') apiID: string
    ) {
        const data = await this.nlpService.unsubscribe(apiID);
        return data;
    }

    // route to retrieve all NLP services currently available
    @Get('services')
    async listAllServices() {
        const data = await this.nlpService.retrieveAll();
        
        // drop sensitive data like api endpoints and rename id before sending to client
        const modifiedData = data.payload.map((item) => ({
            id: item._id,
            name: item.name,
            version: item.version,
            description: item.description
        }));
        return { payload: modifiedData };
    }

    // route to retrieve specific NLP service
    @Get('services/:id')
    async getService(@Param('id') apiID: string) {
        const data = await this.nlpService.retrieveOne(apiID);

        // drop sensitive data like api endpoints and rename id before sending to client
        const { _id, endpoints, __v, ...rest } = data.toJSON();
        const id = _id.toHexString();
        const responseData = { id, ...rest };
        return responseData;
    }
}