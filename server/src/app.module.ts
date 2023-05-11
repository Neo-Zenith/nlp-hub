import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { CheckAuthMiddleware } from './users/user.middleware';

@Module({
	imports: [MongooseModule.forRoot('mongodb+srv://neozenith:nlphub@nlp-hub.mbc3aja.mongodb.net/nlp-hub-db?retryWrites=true&w=majority'), UserModule],
	controllers: [],
	providers: [],
})

export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
	  consumer
		.apply(CheckAuthMiddleware)
		.forRoutes('*');
	}
  }
