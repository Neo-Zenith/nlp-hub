import { HttpException, HttpStatus } from "@nestjs/common";
import { NlpEndpointModel, NlpEndpointSchema, NlpModel, NlpSchema } from "./nlp.model";

// Triggers for NlpSchema
export function NlpTrigger() {
    // Pre-save trigger
    NlpSchema.pre('save', async function(next) {
        // Find if another service of the same address already exist
        const service = await NlpModel.findOne({
            baseAddress: this.baseAddress
        })
        
        if (service) {
            throw new HttpException("Service already registered", HttpStatus.CONFLICT)
        }

        return next();
    })

    NlpSchema.pre('updateOne', async function (next) {
        const baseAddress = this.getUpdate()['$set']['baseAddress'];

        if (baseAddress) {
            const service = await NlpModel.findOne({
                baseAddress
            });
      
            if (service && service.id !== this['_conditions']['_id']) {
                throw new Error("Service with the same base address already registered");
            }
        }
      
        return next();
    });

    // Pre-delete trigger
    NlpSchema.pre('deleteOne', async function(next) {
        await NlpEndpointModel.deleteMany({
            serviceID: this.getFilter()["_id"]
        })

        return next();
    })
}

// Pre-save trigger for NlpEndpoint
export function NlpEndpointTrigger() {
    NlpEndpointSchema.pre('save', async function(next) {
        // FK constraint check for serviceID
        const service = await NlpModel.findById(this.serviceID);
        if (! service) {
            throw new HttpException("Service not found", HttpStatus.NOT_FOUND);
        }

        // Unique constraint check for <serviceID, endpoint, method>
        const endpointExist = await NlpEndpointModel.findOne({
            serviceID: this.serviceID,
            endpointPath: this.endpointPath,
            method: this.method
        })
        if (endpointExist) {
            throw new HttpException(
                "Endpoint of the given method already registered",
                HttpStatus.CONFLICT)
        }

        // Unique constraint check for <serviceID, task>
        const taskExist = await NlpEndpointModel.findOne({
            serviceID: this.serviceID,
            task: this.task
        })
        if (taskExist) {
            throw new HttpException(
                "Task for the requested service already registered",
                HttpStatus.CONFLICT
            )
        }

        return next();
    })
}