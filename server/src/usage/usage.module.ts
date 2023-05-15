import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsageSchema } from "./usage.model";
import { UsageController } from "./usage.controller";
import { UsageService } from "./usage.service";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Usage', schema: UsageSchema}])
    ],
    controllers: [UsageController],
    providers: [UsageService]
})

export class UsageModule {};