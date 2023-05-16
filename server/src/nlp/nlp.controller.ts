import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { NlpService } from "./nlp.service";
import { Debug } from "src/custom/debug/debug";
import { NlpConfig, NlpEndpoint } from "./nlp.model";

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
        @Body('endpoints') apiEndpoints: NlpEndpoint[],
        @Body('config') apiConfig: NlpConfig[]
    ) {
        try {
            const apiID = await this.nlpService.subscribe(
                apiName,
                apiVersion,
                apiDesc,
                apiEndpoints,
                apiConfig);
            return {id: apiID};
        } catch (err) {
            Debug.devLog('subscribeNlp', err);
            if (err.name === 'ValidationError') {
                throw new HttpException('Bad Request (Incomplete Body)', HttpStatus.BAD_REQUEST)
            } else if (err.name === 'TypeError') {
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
        @Body('endpoints') apiEndpoints: NlpEndpoint[],
        @Body('config') apiConfig: NlpConfig[]
    ) {
        try {
            await this.nlpService.unsubscribe(apiID);
            const newID = await this.nlpService.subscribe(
                apiName,
                apiVersion,
                apiDesc,
                apiEndpoints,
                apiConfig
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
        const data = await this.nlpService.retrieveAllServices();
        
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
        try {
            const data = await this.nlpService.retrieveOneService(apiID);
            if (!data) {
                throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND);
            }
    
            // drop sensitive data like api endpoints and rename id before sending to client
            const { _id, __v, ...rest } = data.toJSON();
            const id = _id.toHexString();
            const responseData = { id, ...rest };
            return responseData;

        } catch(err) {
            Debug.devLog(null, err);
            if (err.name === "CastError") {
                throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
            }
        }
    }

    @Get('endpoints')
    async listAllEndpoints() {
        const data = await this.nlpService.retrieveAllEndpoints();
        console.log(data)
        var modifiedData = []

        for (const endpoint of data) {
            const api = await this.nlpService.retrieveOneService(endpoint.serviceID)
            if (! api) {
                throw new HttpException("Internal Server Error (FK Constraint Violated)", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const endpointData = {
                id: endpoint._id,
                apiName: api.name,
                apiVersion: api.version,
                apiDescription: api.description,
                url: endpoint.url,
                method: endpoint.method
            }

            modifiedData.push(endpointData)
        }
        return modifiedData;
    }

    @Get('endpoints/:id')
    async getEndpoint(@Param('id') endpointID: string) {
        const data = await this.nlpService.retrieveOneEndpoint(endpointID);

        if (!data) {
            throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND);
        }

        const api = await this.nlpService.retrieveOneService(data.serviceID)
        if (! api) {
            throw new HttpException("Internal Server Error (FK Constraint Violated)", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // drop sensitive data like api endpoints and rename id before sending to client
        const endpointData = {
            id: data._id,
            apiName: api.name,
            apiVersion: api.version,
            apiDescription: api.description,
            url: data.url,
            method: data.method
        }

        return endpointData;
    }

    async getServiceEndpoint() {
        
    }
}