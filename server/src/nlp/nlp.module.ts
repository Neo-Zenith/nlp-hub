import { Module } from "@nestjs/common";
import { NlpController } from "./nlp.controller";
import { NlpService } from "./nlp.service";
import { MongooseModule } from "@nestjs/mongoose";
import { NlpSchema } from "./nlp.model";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Nlp', schema: NlpSchema}])
    ],
    controllers: [NlpController],
    providers: [NlpService]
})

export class NlpModule {};