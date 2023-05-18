import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QuerySchema } from "./query.model";
import { QueryService } from "./query.service";
import { QueryController } from "./query.controller";
import { NlpModule } from "src/nlp/nlp.module";
import { NlpEndpointSchema, NlpSchema } from "src/nlp/nlp.model";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Query', schema: QuerySchema}]),
        MongooseModule.forFeature([{name: 'Nlp', schema: NlpSchema}]),
        MongooseModule.forFeature([{name: 'NlpEndpoint', schema: NlpEndpointSchema}]),
        NlpModule],
    providers: [QueryService],
    controllers: [QueryController]
})

export class QueryModule{}