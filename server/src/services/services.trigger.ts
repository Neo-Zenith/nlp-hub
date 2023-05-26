import { HttpException, HttpStatus } from "@nestjs/common";
import { NlpEndpointModel, NlpEndpointSchema, NlpModel, NlpSchema } from "./services.model";

// Triggers for NlpSchema
export function NlpTrigger() {
    // Pre-save trigger
    NlpSchema.pre('save', async function(next) {
        const highestVersion = await NlpModel.findOne({ type: this.type })
            .sort({ version: -1 });

        const version = highestVersion ? parseInt(highestVersion.version.substring(1)) + 1: 1;
        this.version = "v" + version;

        return next();
    })

    // Pre-delete trigger
    NlpSchema.pre('deleteOne', async function(next) {
        await NlpEndpointModel.deleteMany({
            serviceID: this.getFilter()["_id"]
        })

        return next();
    })
}