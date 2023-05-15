import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { NlpService } from "./nlp.service";
import { Debug } from "src/custom/debug/debug";

@Controller('nlp')
export class NlpController {
    constructor(
        private readonly nlpService: NlpService
    ) {}
    
    /**
     * Route to subscribe an NLP API to server
     * @param apiName Name of the API
     * @param apiVersion Version of the API
     * @param apiDesc Description of the API
     * @param apiEndpoints Endpoints of the API
     * @returns 
     */
    @Post('register')
    async subscribeNlp(
        @Body('name') apiName: string,
        @Body('version') apiVersion: string,
        @Body('description') apiDesc: string,
        @Body('endpoints') apiEndpoints: string[]
    ) {
        try {
            const apiID = await this.nlpService.subscribe(
                apiName,
                apiVersion,
                apiDesc,
                apiEndpoints);
            return {id: apiID};
        } catch (err) {
            Debug.devLog(null, err);
            if (err.name === 'ValidationError') {
                throw new HttpException('Bad Request (Incomplete Body)', HttpStatus.BAD_REQUEST)
            }
        }
        
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
        try {
            await this.nlpService.unsubscribe(apiID);
            const newID = await this.nlpService.subscribe(
                apiName,
                apiVersion,
                apiDesc,
                apiEndpoints
            )
            return ({
                id: newID
            })
        } catch (err) {
            Debug.devLog(null, err);
            if (err.name === 'ValidationError') {
                throw new HttpException('Bad Request (Incomplete Body)', HttpStatus.BAD_REQUEST)
            }
        }
    }

    // route to unsubscribe NLP API from server
    @Post('unregister')
    async unsubscribeNlp(
        @Body('id') apiID: string
    ) {
        const data = await this.nlpService.unsubscribe(apiID);
        if (!data) {
            throw new HttpException("Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
        }
        return {message: "OK (Service Unregistered)"};
    }

    // route to retrieve all NLP services currently available
    @Get('services')
    async listAllServices() {
        const data = await this.nlpService.retrieveAll();
        
        // drop sensitive data like api endpoints and rename id before sending to client
        const modifiedData = data.map((item) => ({
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

        if (!data) {
            throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND);
        }

        // drop sensitive data like api endpoints and rename id before sending to client
        const { _id, endpoints, __v, ...rest } = data.toJSON();
        const id = _id.toHexString();
        const responseData = { id, ...rest };
        return responseData;
    }
}