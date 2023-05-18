import { HttpException, HttpStatus } from "@nestjs/common";
import { CustomRequest } from "./request/request.model";

export abstract class MissingFieldsMiddleware {
    protected requiredFields;

    constructor(requiredFields: string[]) {
        this.requiredFields = requiredFields;
    }

    checkMissingFields(req: CustomRequest) {
        const missingFields = this.requiredFields.filter((field) => ! req.body[field]);
        if (missingFields.length > 0) {
            throw new HttpException(`Incomplete body (${missingFields.join(', ')})`, 
                                    HttpStatus.BAD_REQUEST);
        }
        return false;
    }
}