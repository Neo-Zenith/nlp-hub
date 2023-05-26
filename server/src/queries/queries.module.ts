import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QuerySchema } from "./queries.model";
import { QueryService } from "./queries.service";
import { QueryController, UsageController } from "./queries.controller";
import { NlpModule } from "src/services/services.module";
import { NlpEndpointSchema, NlpSchema } from "src/services/services.model";
import { UserSchema } from "src/users/users.model";

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