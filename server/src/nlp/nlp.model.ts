import { HttpException, HttpStatus } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getModelForClass } from '@typegoose/typegoose';
import mongoose, { Document, Types } from 'mongoose';

/**
 * Nlp(id, name, version, description)
 * PK: id
 * NOT NULL: name, version
 */
@Schema()
export class Nlp extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    version: string;

    @Prop()
    description: string;
}

/**
 * NlpEndpoint(id, serviceID, method, options, url)
 * PK: id
 * FK: serviceID
 * NOT NULL: method, url
 */
@Schema()
export class NlpEndpoint extends Document {
    @Prop({ type: Types.ObjectId, ref: Nlp.name, required: true })
    serviceID: string;

    @Prop({ required: true })
    method: string;

    @Prop({ type: Map, of: String })
    options: Record<string, any>;

    @Prop({ required: true })
    url: string;
} 

/**
 * NlpConfig(id, serviceID, task, endpointID)
 * PK: id
 * FK: serviceID, endpointID
 * NOT NULL: task
 */
@Schema()
export class NlpConfig extends Document {
    @Prop({ type: Types.ObjectId, ref: Nlp.name, required: true })
    serviceID: string;

    @Prop({ required: true })
    task: string;

    @Prop({ type: Types.ObjectId, ref: NlpEndpoint.name, required: true })
    endpointID: string;
}

export const NlpSchema = SchemaFactory.createForClass(Nlp);
export const NlpModel = mongoose.model('Nlp', NlpSchema);
export const NlpEndpointSchema = SchemaFactory.createForClass(NlpEndpoint);
export const NlpEndpointModel = mongoose.model('NlpEndpoint', NlpEndpointSchema)
export const NlpConfigSchema = SchemaFactory.createForClass(NlpConfig);
export const NlpConfigModel = mongoose.model('NlpConfig', NlpConfigSchema)

// Pre-save trigger for NlpSchema
NlpSchema.pre('save', async function(next) {
    const api = await NlpModel.findOne({
        name: this.name,
        version: this.version
    })

    if (api) {
        throw new HttpException("Duplicated Service Registered", HttpStatus.CONFLICT)
    }

    return next();
})

// Pre-save trigger for NlpEndpoint
NlpEndpointSchema.pre('save', async function(next) {
    // FK constraint check for serviceID
    const api = await NlpModel.findById(this.serviceID);
    if (!api) {
        throw new HttpException("Service Not Found", HttpStatus.NOT_FOUND);
    }

    return next();
})

// Pre-save trigger for NlpConfig
NlpConfigSchema.pre('save', async function(next) {
    // FK constraint check for serviceID
    const api = await NlpModel.findById(this.serviceID);
    if (!api) {
        throw new HttpException("Service Not Found", HttpStatus.NOT_FOUND);
    }

    // FK constraint check for endpointID
    const endpoint = await NlpEndpointModel.findById(this.endpointID);
    if (!endpoint) {
        throw new HttpException("Endpoint Not Found", HttpStatus.NOT_FOUND);
    }

    // One-to-many degree constraint check for <serviceID, endpointID>
    const serviceEndpointDupMap = await NlpConfigModel.findOne({
        serviceID: this.serviceID,
        endpointID: this.endpointID
    })

    if (serviceEndpointDupMap) {
        throw new HttpException(
            "Unique Constraint Violated (Unique Endpoint for Service)", 
            HttpStatus.BAD_REQUEST)
    }

    // One-to-many degree constraint check for <serviceID, task>
    const taskExist = await NlpConfigModel.findOne({
        serviceID: this.serviceID,
        task: this.task
    })

    if (taskExist) {
        throw new HttpException(
            "Unique Constraint Violated (Unique Task for Service)", HttpStatus.BAD_REQUEST
        )
    }
})