import { HttpException, HttpStatus } from '@nestjs/common'
import { QuerySchema } from './queries.model'
import { ServiceEndpointModel, ServiceModel } from '../services/services.model'

export function QueryTrigger() {
    QuerySchema.pre('save', async function (next) {
        const service = await ServiceModel.findById(this.serviceID).exec()
        if (!service) {
            const message = 'Service not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }

        const endpoint = await ServiceEndpointModel.findById(this.endpointID).exec()
        if (!endpoint) {
            const message = 'Endpoint not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }

        return next()
    })
}
