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
        @Req() request: CustomRequest, 
        @Body('serviceID') serviceID: string,
        @Body('input') input: string,
        @Body('output') output: string,
        @Body('endpointID') endpointID: string,
        @Body('options') options: Record<string, string>
        ) {
            const usageID = await this.usageService.addUsage(
                request.payload.id, serviceID, endpointID, input, output, options
            )
            return { id: usageID }
        }

    @Post('remove')
    async removeUsage(
        @Body('id') usageID: string, 
        @Req() request: CustomRequest
        ) {
            const message = await this.usageService.removeUsage(usageID, request.payload.id);
            return message;
    }

    @Get('')
    async listAllUsage(@Req() request: CustomRequest) {
        if (request.payload.role === 'admin') {
            const data = await this.usageService.retrieveAllUsagesForAdmin();
            return { usages: data };
        } else {
            const usages = await this.usageService
                            .retrieveAllUsagesForUser(request.payload.id);
            return { usages: usages };
        }
    }

    @Get(':id') 
    async getUsage(@Param('id') usageID: string, @Req() request: CustomRequest) {
        if (request.payload.role === 'admin') {
            const usage = await this.usageService.retrieveOneUsageForAdmin(usageID);
            return usage;
        } else {
            const usage = await this.usageService.retrieveOneUsageForUser(usageID, request.payload.id);
            return usage;
        }
    }
}