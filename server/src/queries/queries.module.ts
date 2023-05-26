import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QuerySchema } from "./queries.model";
import { QueryService } from "./queries.service";
import { QueryController, UsageController } from "./queries.controller";
import { ServiceModule } from "src/services/services.module";
import { ServiceEndpointSchema, ServiceSchema } from "src/services/services.model";
import { AdminSchema, UserSchema } from "src/users/users.model";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Query', schema: QuerySchema}]),
        MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
        MongooseModule.forFeature([{name: 'Admin', schema: AdminSchema}]),
        MongooseModule.forFeature([{name: 'Service', schema: ServiceSchema}]),
        MongooseModule.forFeature([
            {name: 'ServiceEndpoint', schema: ServiceEndpointSchema}
        ]),
        ServiceModule],
    providers: [QueryService],
    controllers: [QueryController, UsageController]
})

export class QueryModule{}