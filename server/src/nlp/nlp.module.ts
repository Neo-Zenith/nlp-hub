import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { NlpController } from "./nlp.controller";
import { NlpService } from "./nlp.service";
import { MongooseModule } from "@nestjs/mongoose";
import { NlpEndpointSchema, NlpSchema } from "./nlp.model";
import { 
    RegisterEndpointMiddleware, 
    RegisterServiceMiddleware, 
    RemoveEndpointMiddleware, 
    RemoveServiceMiddleware, 
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
            .forRoutes('/services/subscribe');

        consumer
            .apply(RemoveServiceMiddleware)
            .forRoutes('/services/unsubscribe');

        consumer
            .apply(UpdateServiceMiddleware)
            .forRoutes('/services/update');

        consumer
            .apply(RegisterEndpointMiddleware)
            .forRoutes({ 
                path: '/services/:type/:version/endpoints/add', 
                method: RequestMethod.POST 
            });

        consumer
            .apply(UpdateEndpointMiddleware)
            .forRoutes({ 
                path: '/services/:type/:version/endpoints/update', 
                method: RequestMethod.POST 
            });

        consumer
            .apply(RemoveEndpointMiddleware)
            .forRoutes({
                path: '/services/:type/:version/endpoints/remove',
                method: RequestMethod.POST
            })
    }
};