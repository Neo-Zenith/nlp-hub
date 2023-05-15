import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { CheckAdminAuthMiddleware, CheckUserAuthMiddleware } from './users/user.middleware';
import * as dotenv from "dotenv";
import { NlpModule } from './nlp/nlp.module';
import { UsageModule } from './usage/usage.module';

dotenv.config();
@Module({
	imports: [MongooseModule.forRoot('mongodb+srv://neozenith:'+ process.env.DB_SECRET +'@nlp-hub.mbc3aja.mongodb.net/nlp-hub-db?retryWrites=true&w=majority'), 
	UserModule, 
	NlpModule,
	UsageModule],
	controllers: [],
	providers: [],
})

export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		// access token check applies to all routes
		consumer.apply(CheckUserAuthMiddleware).exclude('/nlp/*').forRoutes('*');
		consumer.apply(CheckAdminAuthMiddleware).forRoutes('/nlp/*');
	}
}
