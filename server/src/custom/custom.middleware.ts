import { HttpException, HttpStatus } from "@nestjs/common";
import { CustomRequest } from "./request/request.model";
import { Debug } from "./debug/debug";

export abstract class MissingFieldsMiddleware {
    protected requiredFields;

    constructor(requiredFields: string[]) {
        this.requiredFields = requiredFields;
    }

    checkMissingFields(req: CustomRequest) {
        const missingFields = this.requiredFields.filter((field) => ! req.body[field]);
        if (missingFields.length > 0) {
            const message = `Incomplete body (${missingFields.join(', ')})`
            Debug.devLog("MissingFieldsMiddleware", message)
            throw new HttpException(message, 
                                    HttpStatus.BAD_REQUEST);
        }
        return false;
    }
}