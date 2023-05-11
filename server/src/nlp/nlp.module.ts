import { Module } from "@nestjs/common";
import { NlpController } from "./nlp.controller";
import { NlpService } from "./nlp.service";

@Module({
    imports: [],
    controllers: [NlpController],
    providers: [NlpService]
})

export class NlpModule {};