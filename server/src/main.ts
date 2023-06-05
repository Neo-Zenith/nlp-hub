import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.enableCors({
        allowedHeaders: ['content-type'],
        methods: ['POST', 'PUT', 'DELETE', 'GET'],
        origin: '*',
        credentials: true,
    })
    const options = new DocumentBuilder()
        .setTitle('NLP Hub')
        .setDescription('API endpoints for NLP Hub')
        .setVersion('1.0')
        .addBearerAuth(
            {
                description: `Please enter your access token`,
                name: 'Authorization',
                bearerFormat: 'Bearer',
                scheme: 'Bearer',
                type: 'http',
                in: 'Header',
            },
            'access-token',
        )
        .build()

    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('api', app, document)
    await app.listen(8080)
}

bootstrap()
