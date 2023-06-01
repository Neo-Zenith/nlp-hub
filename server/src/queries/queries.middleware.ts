import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { Response, NextFunction } from 'express'
import * as multer from 'multer'
import { ValidateRequestBodyMiddleware } from '../common/common.middleware'
import { CustomRequest } from '../common/request/request.model'

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

@Injectable()
export class CreateQueryMiddleware extends ValidateRequestBodyMiddleware implements NestMiddleware {
    constructor() {
        const fields = {
            options: { type: 'object', required: false },
        }
        super(fields)
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.checkFields(req)
        return next()
    }
}

@Injectable()
export class RetrieveUsagesMiddleware implements NestMiddleware {
    use(req: CustomRequest, res: Response, next: NextFunction): void {
        this.validateExecTime(req)
        this.validateDates(req)
        this.validateTimezone(req)
        this.validateBoolean(req)
        return next()
    }

    private validateExecTime(req: CustomRequest) {
        const { executionTime } = req.query
        if (executionTime) {
            const execTime = +executionTime
            if (Number.isNaN(execTime)) {
                const message = `Invalid execution time format. Expected a parsable integer, but received '${typeof execTime}'.`
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }
        }
    }

    private validateTimezone(req: CustomRequest) {
        const { timezone } = req.query

        if (timezone) {
            if (isNaN(parseFloat(timezone as string))) {
                const message = 'Invalid timezone. Timezone must be a valid integer.'
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }
        }
    }

    private validateDates(req: CustomRequest) {
        const { startDate, endDate } = req.query

        if (startDate) {
            let startDateTime = startDate as string
            if (!/^(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2}:\d{2})?$/.test(startDateTime)) {
                const message =
                    'Invalid startDate format. Start date must be in YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS format.'
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }

            if (!startDateTime.includes('T')) {
                startDateTime += 'T00:00:00Z'
            } else {
                startDateTime += 'Z'
            }

            if (Number.isNaN(new Date(startDateTime).getTime())) {
                const message = 'Invalid start date or time.'
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }
        }

        if (endDate) {
            let endDateTime = endDate as string
            if (!/^(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2}:\d{2})?$/.test(endDateTime)) {
                const message =
                    'Invalid startDate format. End date must be in YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS format.'
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }

            if (!endDateTime.includes('T')) {
                endDateTime += 'T23:59:59Z'
            } else {
                endDateTime += 'Z'
            }

            if (Number.isNaN(new Date(endDateTime).getTime())) {
                throw new HttpException('Invalid end date or time.', HttpStatus.BAD_REQUEST)
            }
        }
    }

    private validateBoolean(req: CustomRequest): void {
        const { returnDelService, returnDelUser } = req.query
        const booleanValues = ['true', 'false']

        if (returnDelUser) {
            const returnDelUserStr = returnDelUser as string
            if (!booleanValues.includes(returnDelUserStr.toLowerCase())) {
                const message = `Invalid type for returnDelUser. Expected any of '${Object.values(
                    booleanValues,
                ).join(', ')}', but received '${returnDelUser}'.`
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            } else {
                req.query.returnDelUser = JSON.parse(returnDelUserStr.toLowerCase())
            }
        }

        if (returnDelService) {
            const returnDelServiceStr = returnDelService as string
            if (!booleanValues.includes(returnDelServiceStr.toLowerCase())) {
                const message = `Invalid type for returnDelService. Expected any of '${Object.values(
                    booleanValues,
                ).join(', ')}', but received '${returnDelService}'.`
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            } else {
                req.query.returnDelService = JSON.parse(returnDelServiceStr.toLowerCase())
            }
        }
    }
}

@Injectable()
export class RetrieveUsageMiddleware implements NestMiddleware {
    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.validateTimezone(req)
        return next()
    }

    private validateTimezone(req: CustomRequest) {
        const { timezone } = req.query

        if (timezone) {
            if (isNaN(parseFloat(timezone as string))) {
                const message = 'Invalid timezone. Timezone must be a valid integer.'
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }
        }
    }
}
