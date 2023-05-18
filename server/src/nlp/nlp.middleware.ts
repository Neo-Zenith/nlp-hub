import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { Request, NextFunction } from 'express';

@Injectable()
export class RegisterServiceMiddleware implements NestMiddleware {
    private requiredFields = ['name', 'version', 'description', 'address', 
                                'endpoints', 'config'];

    use(req: Request, next: NextFunction) {
        // Perform the validation logic here
        const missingFields = this.requiredFields.filter((field) => ! req.body[field]);

        if (missingFields.length > 0) {
            throw new HttpException(`Incomplete Body (${missingFields.join(', ')})`, 
                                    HttpStatus.BAD_REQUEST);
        }
        return next();
    }
}