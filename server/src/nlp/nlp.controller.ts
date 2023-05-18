import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { NlpService } from "./nlp.service";
import { Debug } from "src/custom/debug/debug";
import { NlpConfig, NlpEndpoint } from "./nlp.model";

@Controller('nlp')
export class NlpController {
    constructor(
        private readonly nlpService: NlpService
    ) {}
    
    // route to register NLP API to server
    @Post('register')
    async subscribeNlp(
        @Body('name') serviceName: string,
        @Body('version') serviceVersion: string,
        @Body('description') serviceDesc: string,
        @Body('address') serviceAddr: string,
        @Body('endpoints') serviceEndpoints: NlpEndpoint[],
        @Body('config') serviceConfig: NlpConfig[]
    ) {
        const serviceID = await this.nlpService.subscribe(
            serviceName,
            serviceVersion,
            serviceDesc,
            serviceAddr,
            serviceEndpoints,
            serviceConfig);
        return {id: serviceID};
    }

    // route to update NLP API info (version/routes/name)
    @Post('update')
    async updateNlp(
        @Body('id') apiID: string,
        @Body('name') apiName: string,
        @Body('version') apiVersion: string,
        @Body('description') apiDesc: string,
        @Body('address') apiAddr: string,
        @Body('endpoints') apiEndpoints: NlpEndpoint[],
        @Body('config') apiConfig: NlpConfig[]
    ) {
        try {
            const deleted = await this.nlpService.unsubscribe(apiID);
            if (! deleted) {
                throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
            }
            const newID = await this.nlpService.subscribe(
                apiName,
                apiVersion,
                apiDesc,
                apiAddr,
                apiEndpoints,
                apiConfig
            )

            return { id: newID }

        } catch (err) {
            Debug.devLog('updateNlp', err);
            // occurs when saving Nlp without all required fields
            if (err.name === 'ValidationError') {
                throw new HttpException('Bad Request (Incomplete Body)', HttpStatus.BAD_REQUEST)
            } 
            // occurs when saving NlpConfig/NlpEndpoint without all required fields
            else if (err.name === 'TypeError') {
                throw new HttpException('Bad Request (Incomplete Body)', HttpStatus.BAD_REQUEST)
            }
            // catch the thrown http exception in the try block
            else if (err.name === 'HttpException') {
                throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
            }
        }
    }

    // route to unsubscribe NLP API from server
    @Post('unregister')
    async unsubscribeNlp(
        @Body('id') apiID: string
    ) {
        try {
            const data = await this.nlpService.unsubscribe(apiID);
            if (!data) {
                throw new HttpException("Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
            }
            return {message: "OK (Service Unregistered)"};
        } catch (err) {
            Debug.devLog('unsubscribeNlp', err)
            // occurs when ID is not the required format
            if (err.name === 'CastError') {
                throw new HttpException("Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
            }
        }
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
            if (! data) {
                throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND);
            }
    
            // drop sensitive data like api endpoints and rename id before sending to client
            const modifiedData = {
                id: data._id,
                name: data.name,
                version: data.version,
                description: data.description
            };
            return modifiedData

        } catch(err) {
            Debug.devLog('getService', err);
            // occurs when ID is not of the required format
            if (err.name === "CastError") {
                throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
            }
        }
    }

    // get all the possible endpoints from all APIs
    @Get('endpoints')
    async listAllEndpoints() {
        const data = await this.nlpService.retrieveAllEndpoints();
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
                endpoint: endpoint.endpoint,
                method: endpoint.method
            }

            modifiedData.push(endpointData)
        }
        return modifiedData;
    }

    // Get the details of a specific endpoint
    @Get('endpoints/:id')
    async getEndpoint(@Param('id') endpointID: string) {
        var data;
        var api;

        try {
            data = await this.nlpService.retrieveOneEndpoint(endpointID);
            if (! data) {
                throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND);
            }
        } catch (err) {
            Debug.devLog('getEndpoint', err);
            // occurs when ID is not of the required format
            if (err.name === "CastError") {
                throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
            }
        }

        try {
            api = await this.nlpService.retrieveOneService(data.serviceID)
            if (! api) {
                throw new HttpException("Internal Server Error (FK Constraint Violated)", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (err) {
            Debug.devLog('getEndpoint', err);
            // occurs when ID is not of the required format
            if (err.name === "CastError") {
                throw new HttpException("Record Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
            }
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

    // get endpoints of an API
    @Get('services/:id/endpoints')
    async getServiceEndpoint(@Param('id') serviceID: string) {
        const api = await this.getService(serviceID);
        const endpoints = await this.nlpService.retrieveEndpointsForOneService(serviceID);
        var modifiedEndpoints = []

        if (! endpoints) {
            throw new HttpException("Record Not Found (No Valid Endpoints)", HttpStatus.NOT_FOUND)
        }
        for (const endpoint of endpoints) {
            const endpointData = {
                id: endpoint._id,
                apiName: api.name,
                apiVersion: api.version,
                apiDescription: api.description,
                endpoint: endpoint.endpoint,
                method: endpoint.method
            }

            modifiedEndpoints.push(endpointData)
        }

        return modifiedEndpoints;
    }
}