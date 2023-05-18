import { MiddlewareConsumer, Module } from "@nestjs/common";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminSchema, UserSchema } from "./user.model";
import { LoginUserMiddleware, RegisterUserMiddleware } from "./user.middleware";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'User', schema: UserSchema}]), 
        MongooseModule.forFeature([{name: 'Admin', schema: AdminSchema}])],
    controllers: [UserController],
    providers: [UserService]
})

export class UserModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RegisterUserMiddleware)
            .forRoutes('/users/register');

        consumer
            .apply(LoginUserMiddleware)
            .forRoutes('/users/login');
    }
}