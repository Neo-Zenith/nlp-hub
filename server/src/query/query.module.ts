import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QuerySchema } from "./query.model";
import { QueryService } from "./query.service";
import { QueryController } from "./query.controller";
import { NlpModule } from "src/nlp/nlp.module";
import { NlpConfigSchema, NlpEndpointSchema, NlpSchema } from "src/nlp/nlp.model";
import { UsageModule } from "src/usage/usage.module";
import { UsageSchema } from "src/usage/usage.model";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Query', schema: QuerySchema}]),
        MongooseModule.forFeature([{name: 'Nlp', schema: NlpSchema}]),
        MongooseModule.forFeature([{name: 'NlpConfig', schema: NlpConfigSchema}]),
        MongooseModule.forFeature([{name: 'NlpEndpoint', schema: NlpEndpointSchema}]),
        NlpModule],
    providers: [QueryService],
    controllers: [QueryController]
})

export class QueryModule{}