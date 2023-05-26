import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ServiceController } from "./services.controller";
import { ServiceService } from "./services.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ServiceEndpointSchema, ServiceSchema } from "./services.model";
import { 
    RegisterEndpointMiddleware, 
    RegisterServiceMiddleware,  
    UpdateEndpointMiddleware, 
    UpdateServiceMiddleware 
} from "./services.middleware";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Service', schema: ServiceSchema}]),
        MongooseModule.forFeature([{name: 'ServiceEndpoint', schema: ServiceEndpointSchema}])
    ],
    controllers: [ServiceController],
    providers: [ServiceService]
})

export class ServiceModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RegisterServiceMiddleware)
            .forRoutes({
                path: '/services', method: RequestMethod.POST
            });

        consumer
            .apply(UpdateServiceMiddleware)
            .forRoutes({
                path: '/services', method: RequestMethod.PUT
            });

        consumer
            .apply(RegisterEndpointMiddleware)
            .forRoutes({ 
                path: '/services/:type/:version/endpoints', 
                method: RequestMethod.POST 
            });

        consumer
            .apply(UpdateEndpointMiddleware)
            .forRoutes({ 
                path: '/services/:type/:version/endpoints/:task', 
                method: RequestMethod.PUT 
            });
    }
};