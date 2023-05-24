import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AdminController, UserController } from "./users.controller";
import { UserService } from "./users.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminSchema, UserSchema } from "./user.model";
import { ExtendSubscriptionMiddleware, LoginUserMiddleware, RegisterUserMiddleware, RemoveUserMiddleware, RetrieveUsersMiddleware, RetrieveUserMiddleware, UpdateUserMiddleware } from "./user.middleware";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'User', schema: UserSchema}]), 
        MongooseModule.forFeature([{name: 'Admin', schema: AdminSchema}])],
    controllers: [UserController, AdminController],
    providers: [UserService]
})

export class UserModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RegisterUserMiddleware)
            .forRoutes('/users/register', '/admins/register');

        consumer
            .apply(LoginUserMiddleware)
            .forRoutes('/users/login', '/admins/login');

        consumer
            .apply(RemoveUserMiddleware)
            .forRoutes('/users/remove')

        consumer
            .apply(UpdateUserMiddleware)
            .forRoutes('/users/update')

        consumer
            .apply(RetrieveUsersMiddleware)
            .forRoutes('/admins/get-users')

        consumer
            .apply(RetrieveUserMiddleware)
            .forRoutes( { path: '/users/:username', method: RequestMethod.GET })

        consumer
            .apply(ExtendSubscriptionMiddleware)
            .forRoutes('/admins/extend-subscription')
    }
}