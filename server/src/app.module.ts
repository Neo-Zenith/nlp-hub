import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { CheckAuthMiddleware } from './users/user.middleware';
import * as dotenv from "dotenv";
import { NlpModule } from './nlp/nlp.module';

dotenv.config();
@Module({
	imports: [MongooseModule.forRoot('mongodb+srv://neozenith:'+ process.env.DB_SECRET +'@nlp-hub.mbc3aja.mongodb.net/nlp-hub-db?retryWrites=true&w=majority'), 
	UserModule, 
	NlpModule],
	controllers: [],
	providers: [],
})

export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		// access token check applies to all routes
		consumer.apply(CheckAuthMiddleware).forRoutes('*');
	}
  }
