import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QuerySchema } from "./query.model";
import { QueryService } from "./query.service";
import { QueryController, UsageController } from "./query.controller";
import { NlpModule } from "src/nlp/nlp.module";
import { NlpEndpointSchema, NlpSchema } from "src/nlp/nlp.model";
import { UserSchema } from "src/users/user.model";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Query', schema: QuerySchema}]),
        MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
        MongooseModule.forFeature([{name: 'Nlp', schema: NlpSchema}]),
        MongooseModule.forFeature([{name: 'NlpEndpoint', schema: NlpEndpointSchema}]),
        NlpModule],
    providers: [QueryService],
    controllers: [QueryController, UsageController]
})

export class QueryModule{}