import { Module } from "@nestjs/common";
import { NlpController } from "./nlp.controller";
import { NlpService } from "./nlp.service";
import { MongooseModule } from "@nestjs/mongoose";
import { NlpConfigSchema, NlpEndpointSchema, NlpSchema } from "./nlp.model";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Nlp', schema: NlpSchema}]),
        MongooseModule.forFeature([{name: 'NlpEndpoint', schema: NlpEndpointSchema}]),
        MongooseModule.forFeature([{name: 'NlpConfig', schema: NlpConfigSchema}])
    ],
    controllers: [NlpController],
    providers: [NlpService]
})

export class NlpModule {};