import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { NlpController } from "./nlp.controller";
import { NlpService } from "./nlp.service";
import { MongooseModule } from "@nestjs/mongoose";
import { NlpEndpointSchema, NlpSchema } from "./nlp.model";
import { RegisterServiceMiddleware, RetrieveServiceMiddleware, UpdateServiceMiddleware } from "./nlp.middleware";

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
            .forRoutes('/nlp/register');

        consumer
            .apply(RetrieveServiceMiddleware)
            .forRoutes('/nlp/unregister', 
                        { path: '/nlp/services/:id', method: RequestMethod.GET },
                        { path: '/nlp/services/:id/endpoints', method: RequestMethod.GET },
                        { path: '/nlp/endpoints/:id', method: RequestMethod.GET });

        consumer
            .apply(UpdateServiceMiddleware)
            .forRoutes('/nlp/update');
    }
};