import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { CheckAuthMiddleware } from './custom/custom.middleware';
import * as dotenv from "dotenv";
import { NlpModule } from './nlp/nlp.module';
import mongoose from 'mongoose';
import { QueryModule } from './query/query.module';

dotenv.config();
@Module({
	imports: [MongooseModule.forRoot('mongodb+srv://neozenith:'+ process.env.DB_SECRET +'@nlp-hub.mbc3aja.mongodb.net/nlp-hub-db?retryWrites=true&w=majority'), 
	UserModule, 
	NlpModule,
	QueryModule],
	controllers: [],
	providers: [],
})

export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		// access protocol 
		consumer.apply(CheckAuthMiddleware)
		.forRoutes('*');
	}
}

// db connection for models
mongoose.connect('mongodb+srv://neozenith:'+ process.env.DB_SECRET +'@nlp-hub.mbc3aja.mongodb.net/nlp-hub-db?retryWrites=true&w=majority')