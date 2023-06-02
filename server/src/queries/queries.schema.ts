import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ServiceType } from '../services/services.model'

export class HandleEndpointReqSchema {
    @ApiPropertyOptional({
        description:
            'Options required by the endpoint. Option fields must match the pre-defined schema provided by the endpoint.',
        example: {
            message: 'This is a message to be sent over to the NLP service requested.',
            isFluency: true,
            removeAutoCheck: false,
            passes: 0,
        },
    })
    options: Record<string, string>
}

export class HandleEndpointReqResponseSchema {
    @ApiProperty({
        description: 'Uniquely identifies a query made.',
        example: '0ba81115-4f52-23b8-bc07-11e77a932e4f',
    })
    uuid: string

    @ApiProperty({
        description: 'Response from the queried service endpoint.',
        example: {
            prediction: 'This is the predicted output.',
        },
    })
    output: Record<string, any>

    @ApiProperty({
        description: 'Number of seconds taken for the query to be made.',
        example: 2.5,
    })
    executionTime: number
}

export const RetrieveUsagesSchema = {
    executionTime: {
        name: 'executionTime',
        description:
            'Specifies the maximum acceptable execution time, in seconds. Execution time is measured as the time taken between making a request and receiving a response.',
        example: 1,
        required: false,
    },
    type: {
        name: 'type',
        description: `Type of service. Available types are '${Object.values(
            ServiceType,
        ).join(', ')}'.`,
        example: 'SUD',
        required: false,
    },
    version: {
        name: 'version',
        description: 'Unique identifier of service for the specified service type.',
        example: 'v10',
        required: false,
    },
    startDate: {
        name: 'startDate',
        description:
            'Specifies the start date and time for filtering the query documents. It should be in the format YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS. If no time is provided, the start date is assumed to begin at 12:00 AM.',
        example: '2022-12-01',
        required: false,
    },
    endDate: {
        name: 'endDate',
        description:
            'Specifies the end date and time for filtering the query documents. It should be in the format YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS. If no time is provided, the end date is assumed to end at 11:59 PM.',
        example: '2022-12-31',
        required: false,
    },
    timezone: {
        name: 'timezone',
        description:
            'Specifies the timezone for interpreting the provided start and end dates. It should be represented as an integer indicating the timezone offset from Coordinated Universal Time (UTC). Use a negative integer for timezones behind UTC.',
        example: '4',
        required: false,
    },
    returnDelUser: {
        name: 'returnDelUser',
        description: 'Indicate if result should include queries made by users who no longer exist.',
        example: true,
        required: false,
    },
    returnDelService: {
        name: 'returnDelService',
        description:
            'Indicate if result should include queries made on services which have been unregistered.',
        example: true,
        required: false,
    },
}

export class RetrieveUsagesResponseSchema {
    @ApiProperty({
        description: 'Array of usages with attributes matching the filters (if any).',
        example: [
            {
                uuid: '0ba81115-4f52-23b8-bc07-11e77a932e4f',
                output: {
                    prediction: 'This is the prediction output.',
                },
                executionTime: 2.5,
                dateTime: '2022-12-01T08:30:23',
            },
            {
                uuid: '0ba82324-78a1-26b8-bc07-11e689932e78',
                output: {
                    prediction: 'This is the prediction output.',
                },
                executionTime: 3,
                dateTime: '2022-12-02T08:45:23',
            },
        ],
    })
    usages: RetrieveUsageResponseSchema[]
}

export const RetrieveUsageSchema = {
    uuid: {
        name: 'uuid',
        description: 'Unique identifier of a query.',
        example: '0ba81115-4f52-23b8-bc07-11e77a932e4f',
    },
}

export class RetrieveUsageResponseSchema {
    @ApiProperty({
        description: 'Array of usages with attributes matching the filters (if any).',
        example: {
            uuid: '0ba81115-4f52-23b8-bc07-11e77a932e4f',
            output: {
                prediction: 'This is the prediction output.',
            },
            executionTime: 2.5,
            dateTime: '2022-12-01T08:30:23',
        },
    })
    usages: Record<string, any>
}
