import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { Response, NextFunction } from 'express'
import * as multer from 'multer'
import { CustomRequest } from 'src/common/request/request.model'

@Injectable()
export class MulterMiddleware implements NestMiddleware {
    private upload: any

    constructor() {
        this.upload = multer({
            storage: multer.diskStorage({
                destination: './upload',
                filename: function (req: CustomRequest, file, cb) {
                    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9)
                    cb(null, uniqueSuffix + '-' + file.originalname)
                },
            }),
        }).single('file')
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.upload(req, res, (err: any) => {
            if (err) {
                throw new HttpException(
                    'Invalid request. The uploaded file could not be processed.',
                    HttpStatus.BAD_REQUEST,
                )
            }
            return next()
        })
    }
}
