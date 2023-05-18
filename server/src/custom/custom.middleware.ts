import { HttpException, HttpStatus } from "@nestjs/common";
import { CustomRequest } from "./request/request.model";
import { Debug } from "./debug/debug";

export abstract class MissingFieldsMiddleware {
    protected requiredFields;

    constructor(requiredFields: string[]) {
        this.requiredFields = requiredFields;
    }

    checkMissingFields(req: CustomRequest) {
        var requestBody;

        if (req.method === 'POST') {
            requestBody = req.body;
        } else if (req.method === 'GET') {
            requestBody = req.params;
        }

        const missingFields = this.requiredFields.filter((field) => ! requestBody[field]);
        if (missingFields.length > 0) {
            const message = `Incomplete body (${missingFields.join(', ')})`
            Debug.devLog("MissingFieldsMiddleware", message)
            throw new HttpException(message, 
                                    HttpStatus.BAD_REQUEST);
        }
        return false;
    }
}