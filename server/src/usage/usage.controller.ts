import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { UsageService } from "./usage.service";
import { CustomRequest } from "src/custom/request/request.model";

@Controller('usage')
export class UsageController {
    constructor(
        private readonly usageService: UsageService
    ) {}

    @Post('add')
    async addUsage(
        @Body('userID') userID: string, 
        @Body('serviceID') serviceID: string,
        @Body('input') input: string,
        @Body('output') output: string,
        @Body('options') options: Record<string, string>) {
        const usageID = await this.usageService.addUsage(
            userID, serviceID, input, output, options
        )
        return ({id: usageID})
    }

    @Post('remove')
    async removeUsage(usageID: string, userID: string) {
        const data = await this.usageService.removeUsage(usageID, userID);
        return data;
    }

    @Get()
    async listAllUsage() {
        const data = await this.usageService.retrieveAll();
        return data;
    }

    @Get(':id') 
    async getUsage(@Param('id') usageID: string, @Req() request: CustomRequest) {
        const usage = await this.usageService.retrieveOne(usageID, request.payload.userID);
        return usage;
    }
}