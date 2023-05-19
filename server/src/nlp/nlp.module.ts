import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { EndpointController, NlpController } from "./nlp.controller";
import { NlpService } from "./nlp.service";
import { MongooseModule } from "@nestjs/mongoose";
import { NlpEndpointSchema, NlpSchema } from "./nlp.model";
import { RegisterServiceMiddleware, RetrieveEndpointMiddleware, RetrieveServiceMiddleware, UpdateServiceMiddleware } from "./nlp.middleware";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Nlp', schema: NlpSchema}]),
        MongooseModule.forFeature([{name: 'NlpEndpoint', schema: NlpEndpointSchema}])
    ],
    controllers: [NlpController, EndpointController],
    providers: [NlpService]
})

export class NlpModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RegisterServiceMiddleware)
            .forRoutes('/services/subscribe');

        consumer
            .apply(RetrieveServiceMiddleware)
            .forRoutes('/services/unsubscribe', 
                        { path: '/services/:id', method: RequestMethod.GET },
                        { path: '/services/:id/endpoints', method: RequestMethod.GET });

        consumer
            .apply(UpdateServiceMiddleware)
            .forRoutes('/services/update');

        consumer    
            .apply(RetrieveEndpointMiddleware)
            .forRoutes({ path: '/endpoints/:id', method: RequestMethod.GET });
    }
};