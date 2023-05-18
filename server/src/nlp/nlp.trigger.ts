import { HttpException, HttpStatus } from "@nestjs/common";
import { NlpConfigModel, NlpConfigSchema, NlpEndpointModel, NlpEndpointSchema, NlpModel, NlpSchema } from "./nlp.model";
import mongoose from "mongoose";

// Pre-save trigger for NlpSchema
export function NlpTrigger() {
    NlpSchema.pre('save', async function(next) {
        // Find if another service of the same address already exist
        const service = await NlpModel.findOne({
            address: this.address
        })
        
        if (service) {
            throw new HttpException("Duplicated Service Registered", HttpStatus.CONFLICT)
        }

        return next();
    })
}

// Pre-save trigger for NlpEndpoint
export function NlpEndpointTrigger() {
    NlpEndpointSchema.pre('save', async function(next) {
        // Validate if serviceID is a valid ObjectID
        if (! mongoose.isValidObjectId(this.serviceID)) {
            throw new HttpException("Service Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
        }

        // FK constraint check for serviceID
        const service = await NlpModel.findById(this.serviceID);
        if (! service) {
            throw new HttpException("Service Not Found", HttpStatus.NOT_FOUND);
        }

        // Unique constraint check for <serviceID, endpoint>
        const endpointExist = await NlpEndpointModel.findOne({
            serviceID: this.serviceID,
            endpoint: this.endpoint
        })
        if (endpointExist) {
            throw new HttpException(
                "Unique Constraint Violated (Unique Endpoint for Service)",
                HttpStatus.CONFLICT)
        }

        return next();
    })
}

// Pre-save trigger for NlpConfig
export function NlpConfigTrigger() {
    NlpConfigSchema.pre('save', async function(next) {
        // Validate if serviceID is a valid ObjectID
        if (! mongoose.isValidObjectId(this.serviceID)) {
            throw new HttpException("Service Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
        }

        // FK constraint check for serviceID
        const service = await NlpModel.findById(this.serviceID);
        if (! service) {
            throw new HttpException("Service Not Found", HttpStatus.NOT_FOUND);
        }

        // Validate if endpointID is a valid ObjectID
        if (! mongoose.isValidObjectId(this.endpointID)) {
            throw new HttpException("Endpoint Not Found (Invalid ID)", HttpStatus.NOT_FOUND)
        }

        // FK constraint check for endpointID
        const endpoint = await NlpEndpointModel.findById(this.endpointID);
        if (! endpoint) {
            throw new HttpException("Endpoint Not Found", HttpStatus.NOT_FOUND);
        }

        // Unique constraint check for <serviceID, endpointID>
        const endpointExist = await NlpConfigModel.findOne({
            serviceID: this.serviceID,
            endpointID: this.endpointID
        })

        if (endpointExist) {
            throw new HttpException(
                "Unique Constraint Violated (Unique Endpoint for Service)", 
                HttpStatus.BAD_REQUEST)
        }

        // Unique constraint check for <serviceID, task>
        const taskExist = await NlpConfigModel.findOne({
            serviceID: this.serviceID,
            task: this.task
        })

        if (taskExist) {
            throw new HttpException(
                "Unique Constraint Violated (Unique Task for Service)", 
                HttpStatus.BAD_REQUEST
            )
        }

        return next();
    })
}