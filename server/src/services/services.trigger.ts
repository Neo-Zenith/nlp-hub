import { HttpException, HttpStatus } from "@nestjs/common";
import { ServiceEndpointModel, ServiceEndpointSchema, ServiceModel, ServiceSchema } from "./services.model";

// Triggers for NlpSchema
export function ServiceTrigger() {
    // Pre-save trigger
    ServiceSchema.pre('save', async function(next) {
        const highestVersion = await ServiceModel.findOne({ type: this.type })
            .sort({ version: -1 });

        const version = highestVersion ? parseInt(highestVersion.version.substring(1)) + 1: 1;
        this.version = "v" + version;

        return next();
    })

    // Pre-delete trigger
    ServiceSchema.pre('deleteOne', async function(next) {
        await ServiceEndpointModel.deleteMany({
            serviceID: this.getFilter()["_id"]
        })

        return next();
    })
}