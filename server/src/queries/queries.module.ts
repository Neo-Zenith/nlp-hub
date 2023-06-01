import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MulterModule } from '@nestjs/platform-express/multer'

import { QuerySchema } from './queries.model'
import { QueryService } from './queries.service'
import { QueryController, UsageController } from './queries.controller'
import { ServiceModule } from '../services/services.module'
import { ServiceEndpointSchema, ServiceSchema } from '../services/services.model'
import { AdminSchema, UserSchema } from '../users/users.model'
import {
    CreateQueryMiddleware,
    MulterMiddleware,
    RetrieveUsageMiddleware,
    RetrieveUsagesMiddleware,
} from './queries.middleware'
import { UserService } from 'src/users/users.service'
import { ServiceService } from 'src/services/services.service'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Query', schema: QuerySchema }]),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
        MongooseModule.forFeature([{ name: 'Service', schema: ServiceSchema }]),
        MongooseModule.forFeature([{ name: 'ServiceEndpoint', schema: ServiceEndpointSchema }]),
        ServiceModule,
        MulterModule.register({
            dest: './upload',
        }),
    ],
    providers: [QueryService, UserService, ServiceService],
    controllers: [QueryController, UsageController],
})
export class QueryModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(MulterMiddleware).forRoutes({
            path: '/query/:type/:version/:task',
            method: RequestMethod.POST,
        })

        consumer.apply(CreateQueryMiddleware).forRoutes({
            path: '/query/:type/:version/:task',
            method: RequestMethod.POST,
        })

        consumer.apply(RetrieveUsagesMiddleware).forRoutes({
            path: '/usages',
            method: RequestMethod.GET,
        })

        consumer.apply(RetrieveUsageMiddleware).forRoutes({
            path: '/usages/:uuid',
            method: RequestMethod.GET,
        })
    }
}
