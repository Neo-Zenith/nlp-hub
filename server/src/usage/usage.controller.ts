import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req } from "@nestjs/common";
import { UsageService } from "./usage.service";
import { CustomRequest } from "src/custom/request/request.model";
import { Usage } from "./usage.model";
import { Debug } from "src/custom/debug/debug";

@Controller('usage')
export class UsageController {
    constructor(
        private readonly usageService: UsageService
    ) {}

    /**
     * [POST] Registers usage history route
     * @param userID ID of the user associated with the usage
     * @param serviceID ID of the service used for the usage
     * @param input Input data during the usage
     * @param output Output result from the service during the usage
     * @param options Options (service-dependant) picked by the user during the usage
     * @returns JSON { id: string }
     */
    @Post('add')
    async addUsage(
        @Body('userID') userID: string, 
        @Body('serviceID') serviceID: string,
        @Body('input') input: string,
        @Body('output') output: string,
        @Body('options') options: Record<string, string>
        ) {
        try {
            const usageID = await this.usageService.addUsage(
                userID, serviceID, input, output, options
            )
            return ({id: usageID})
        } catch (err) {
            Debug.devLog(userID, err);
            if (err.name === 'ValidationError') {
                throw new HttpException('Bad Request (Incomplete Body)', HttpStatus.BAD_REQUEST)
            }
        }
    }

    /**
     * [POST] Delete a specific usage history route
     * @param usageID ID of the target usage to be deleted
     * @param userID ID of the user associated with the target usage
     * @returns JSON { message: string }
     */
    @Post('remove')
    async removeUsage(usageID: string, userID: string) {
        const removed = await this.usageService.removeUsage(usageID, userID);
        if (! removed) {
            throw new HttpException('Record Not Found (Invalid ID)', HttpStatus.NOT_FOUND)
        }
        return {message: "Record Deleted"}
    }

    /**
     * [GET] Retrieves all the usage histories route
     * @returns JSON {payload: Array[{@link Usage}]}
     */
    @Get()
    async listAllUsage() {
        const data = await this.usageService.retrieveAll();
        return { payload: data };
    }

    /**
     * [GET] Retrieves a specific usage history route
     * @param usageID ID of the target usage history to be retrieved
     * @param request {@link CustomRequest} object containing decoded user information
     * @returns JSON {@link Usage}
     */
    @Get(':id') 
    async getUsage(@Param('id') usageID: string, @Req() request: CustomRequest) {
        const usage = await this.usageService.retrieveOne(usageID, request.payload.id);
        if (! usage) {
            throw new HttpException('Record Not Found (Invalid ID)', HttpStatus.NOT_FOUND)
        }

        return usage;
    }
}