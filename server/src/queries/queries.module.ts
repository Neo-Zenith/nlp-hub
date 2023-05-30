import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MulterModule } from '@nestjs/platform-express/multer'

import { QuerySchema } from './queries.model'
import { QueryService } from './queries.service'
import { QueryController, UsageController } from './queries.controller'
import { ServiceModule } from '../services/services.module'
import { ServiceEndpointSchema, ServiceSchema } from '../services/services.model'
import { AdminSchema, UserSchema } from '../users/users.model'

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
    providers: [QueryService],
    controllers: [QueryController, UsageController],
})
export class QueryModule {}
