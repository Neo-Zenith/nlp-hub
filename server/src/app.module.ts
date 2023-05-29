import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModule } from './users/users.module'
import * as dotenv from 'dotenv'
import { ServiceModule } from './services/services.module'
import mongoose from 'mongoose'
import { QueryModule } from './queries/queries.module'
import { ScheduleModule } from '@nestjs/schedule'
import { PingTask } from './common/common.middleware'
import { HttpModule } from '@nestjs/axios'

dotenv.config()
@Module({
    imports: [
        MongooseModule.forRoot(
            'mongodb+srv://neozenith:' +
                process.env.DB_SECRET +
                '@nlp-hub.mbc3aja.mongodb.net/nlp-hub-db?retryWrites=true&w=majority',
        ),
        UserModule,
        ServiceModule,
        QueryModule,
        ScheduleModule.forRoot(),
        HttpModule,
    ],
    controllers: [],
    providers: [PingTask],
})
export class AppModule {}

// db connection for models
mongoose.connect(
    'mongodb+srv://neozenith:' +
        process.env.DB_SECRET +
        '@nlp-hub.mbc3aja.mongodb.net/nlp-hub-db?retryWrites=true&w=majority',
)
