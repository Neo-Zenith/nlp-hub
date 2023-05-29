import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { AdminController, UserController } from './users.controller'
import { UserService } from './users.service'
import { MongooseModule } from '@nestjs/mongoose'
import { AdminSchema, UserSchema } from './users.model'
import {
    ExtendSubscriptionMiddleware,
    LoginUserMiddleware,
    RegisterUserMiddleware,
    RetrieveUsersMiddleware,
} from './users.middleware'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
    ],
    controllers: [UserController, AdminController],
    providers: [UserService],
})
export class UserModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RegisterUserMiddleware)
            .forRoutes(
                { path: '/users/register', method: RequestMethod.POST },
                { path: '/admins/register', method: RequestMethod.POST },
            )

        consumer
            .apply(LoginUserMiddleware)
            .forRoutes(
                { path: '/users/login', method: RequestMethod.POST },
                { path: '/admins/login', method: RequestMethod.POST },
            )

        consumer.apply(RetrieveUsersMiddleware).forRoutes({
            path: '/users',
            method: RequestMethod.GET,
        })

        consumer.apply(ExtendSubscriptionMiddleware).forRoutes({
            path: '/users/:username/extend-subscription',
            method: RequestMethod.PUT,
        })
    }
}
