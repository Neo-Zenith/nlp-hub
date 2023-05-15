import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QuerySchema } from "./query.model";
import { QueryService } from "./query.service";
import { QueryController } from "./query.controller";

@Module({
    imports: [MongooseModule.forFeature([{name: 'Query', schema: QuerySchema}])],
    providers: [QueryService],
    controllers: [QueryController]
})

export class QueryModule{}