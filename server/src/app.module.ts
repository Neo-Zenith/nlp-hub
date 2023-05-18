import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { CheckAdminAuthMiddleware, CheckUserAuthMiddleware, RegisterUserMiddleware } from './users/user.middleware';
import * as dotenv from "dotenv";
import { NlpModule } from './nlp/nlp.module';
import { UsageModule } from './usage/usage.module';
import mongoose from 'mongoose';
import { QueryModule } from './query/query.module';

dotenv.config();
@Module({
	imports: [MongooseModule.forRoot('mongodb+srv://neozenith:'+ process.env.DB_SECRET +'@nlp-hub.mbc3aja.mongodb.net/nlp-hub-db?retryWrites=true&w=majority'), 
	UserModule, 
	NlpModule,
	UsageModule,
	QueryModule],
	controllers: [],
	providers: [],
})

export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		// access protocol 
		consumer.apply(CheckUserAuthMiddleware)
		.exclude(
			'/admins/login', '/admins/register', '/nlp/unregister', '/nlp/register', '/nlp/update'
		)
		.forRoutes('*');

		consumer.apply(CheckAdminAuthMiddleware).exclude('/nlp/services/*')
		.forRoutes(
			'/admins/*','/nlp/unregister', '/nlp/register', '/nlp/update', '/nlp/endpoints/*',
			{ path: '/nlp/services/:id/endpoints', method: RequestMethod.GET });
	}
}

// db connection for models
mongoose.connect('mongodb+srv://neozenith:'+ process.env.DB_SECRET +'@nlp-hub.mbc3aja.mongodb.net/nlp-hub-db?retryWrites=true&w=majority')