import { 
    Injectable, NestInterceptor,ExecutionContext, CallHandler, 
    HttpStatus, HttpException  
} from "@nestjs/common";
import * as sanitize from "mongo-sanitize"

@Injectable()
export class QueryInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const queries = Object.keys(request.query);
        for (const query of queries) {
            request.query[query] = sanitize(request.query[query])
        }
        return next.handle();
    }
}