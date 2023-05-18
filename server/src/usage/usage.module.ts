import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsageSchema } from "./usage.model";
import { UsageController } from "./usage.controller";
import { UsageService } from "./usage.service";
import { RegisterUsageMiddleware, RetrieveUsageMiddleware } from "./usage.middleware";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Usage', schema: UsageSchema}])
    ],
    controllers: [UsageController],
    providers: [UsageService]
})

export class UsageModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RetrieveUsageMiddleware)
            .forRoutes('/usage/remove', 
                        { path: '/usage/:id', method: RequestMethod.GET });

        consumer
            .apply(RegisterUsageMiddleware)
            .forRoutes('/usage/add');
    }
};