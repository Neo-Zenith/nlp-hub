import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { CheckAdminAuthMiddleware, CheckUserAuthMiddleware } from './users/user.middleware';
import * as dotenv from "dotenv";
import { NlpModule } from './nlp/nlp.module';
import { UsageModule } from './usage/usage.module';
import mongoose from 'mongoose';

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
		// access protocol 
		consumer.apply(CheckUserAuthMiddleware).exclude(
			'/nlp/unregister', '/nlp/register', '/nlp/update'
		).forRoutes('*');
		consumer.apply(CheckAdminAuthMiddleware).exclude('/nlp/services/*')
		.forRoutes(
			'/nlp/unregister', '/nlp/register', '/nlp/update');
	}
}

// db connection for models
mongoose.connect('mongodb+srv://neozenith:'+ process.env.DB_SECRET +'@nlp-hub.mbc3aja.mongodb.net/nlp-hub-db?retryWrites=true&w=majority')