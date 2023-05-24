import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { NlpController } from "./nlp.controller";
import { NlpService } from "./nlp.service";
import { MongooseModule } from "@nestjs/mongoose";
import { NlpEndpointSchema, NlpSchema } from "./nlp.model";
import { 
    RegisterEndpointMiddleware, 
    RegisterServiceMiddleware,  
    UpdateEndpointMiddleware, 
    UpdateServiceMiddleware 
} from "./nlp.middleware";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Nlp', schema: NlpSchema}]),
        MongooseModule.forFeature([{name: 'NlpEndpoint', schema: NlpEndpointSchema}])
    ],
    controllers: [NlpController],
    providers: [NlpService]
})

export class NlpModule {
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