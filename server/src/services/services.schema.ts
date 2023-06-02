import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { HttpMethodType, ServiceType, UploadFormat } from './services.model'

export const RetrieveServiceSchema = {
    type: {
        name: 'type',
        description: `Type of service. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
        example: 'SUD',
    },
    version: {
        name: 'version',
        description: "Unique identifier of a service for a service type. Follows 'v{id}' format.",
        example: 'v1',
    },
}

export class RetrieveServiceResponseSchema {
    @ApiProperty({
        description: `Type of service. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
        example: 'SUD',
    })
    type: string

    @ApiProperty({
        description: "Unique identifier of a service for a service type. Follows 'v{id}' format.",
        example: 'v1',
    })
    version: string

    @ApiProperty({
        description: 'Name of service.',
        example: 'SUD v1.0 (Auto-punctuator)',
    })
    name: string

    @ApiProperty({
        description: 'Description of service.',
        example: 'This service is capable of auto-punctuating English sentences.',
    })
    description: string

    @ApiPropertyOptional({
        description: 'URL of the service. Displayed only for admins.',
        example: 'https://sud.speechlab.sg',
    })
    address: string
}

export const RetrieveServicesSchema = {
    name: {
        name: 'name',
        description:
            'Name of the service. Returns all results where the name contains the given value as a substring.',
        example: 'punctuator',
        required: false,
    },
    type: {
        name: 'type',
        description: `Type of service. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
        example: 'SUD',
        required: false,
    },
}

export class RetrieveServicesResponseSchema {
    @ApiProperty({
        description: 'Array of services matching the filters.',
        example: [
            {
                type: 'SUD',
                version: 'v1',
                name: 'SUD v1.0 (Auto-punctuator)',
                description: 'This service is capable of auto-punctuating English sentences.',
                address: 'https://sud.speechlab.sg',
            },
            {
                type: 'SUD',
                version: 'v2',
                name: 'SUD v1.2 (Auto-punctuator v2)',
                description: 'This service is capable of auto-punctuating Mandarin sentences.',
                address: 'https://sud-zn.speechlab.sg',
            },
        ],
    })
    services: RetrieveServiceResponseSchema[]
}

export class RetrieveServiceTypesResponseSchema {
    @ApiProperty({
        description: 'Returns all service types available.',
        example: ['SUD', 'NER', 'GPT'],
    })
    types: string[]
}

export const RetrieveServiceVersionSchema = {
    type: {
        name: 'type',
        description: `Type of service. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
        example: 'SUD',
    },
}

export class RetrieveServiceVersionResponseSchema {
    @ApiProperty({
        description: 'Returns all version IDs of services for the specified service type.',
        example: ['v1', 'v2', 'v3'],
    })
    versions: string[]
}

export class CreateEndpointSchema {
    @ApiProperty({
        description: `HTTP method. Available methods are '${Object.values(HttpMethodType).join(
            ', ',
        )}'.`,
        example: 'POST',
    })
    method: string

    @ApiProperty({
        description: "Endpoint to be called. Include a leading '/''.",
        example: '/predict',
    })
    endpointPath: string

    @ApiProperty({
        description: "Unique identifier for a service's endpoint. Case-sensitive.",
        example: 'predict',
    })
    task: string

    @ApiPropertyOptional({
        description:
            'Identify if the endpoint accepts text-based data or not. If not provided, defaults to true.',
        example: false,
        default: true,
    })
    textBased: boolean

    @ApiPropertyOptional({
        description:
            'Options required by the endpoint. Options must be stored in <field, type-accepted> pair',
        example: {
            message: 'string',
            isFluency: 'boolean',
            removeAutoCheck: 'boolean',
            passes: 'number',
        },
    })
    options: Record<string, string>

    @ApiPropertyOptional({
        description: `Uploadable formats supported by the endpoint. Available formats are '${Object.values(
            UploadFormat,
        ).join(', ')}'.`,
        example: ['IMAGE', 'AUDIO'],
    })
    supportedFormats: string[]
}

export class CreateServiceSchema {
    @ApiProperty({
        description: 'Name of the service.',
        example: 'SUD v1.0 (Auto-punctuator)',
    })
    name: string

    @ApiPropertyOptional({
        description: 'Description of the service.',
        example: 'This service is capable of auto-punctuating English sentences.',
    })
    description: string

    @ApiProperty({
        description: `Type of service. Available types are '${Object.values(ServiceType).join(
            ', ',
        )}'.`,
        example: 'SUD',
    })
    type: string

    @ApiProperty({
        description:
            "IP address/URL of the service. Address is unique for each service. Must not include a trailing '/''. Include port number if necessary.",
        example: 'https://sud.speechlab.sg',
    })
    address: string

    @ApiProperty({
        type: [CreateEndpointSchema],
        description: 'Array of endpoints provided by the service',
    })
    endpoints: CreateEndpointSchema[]
}

export class UpdateServiceSchema {
    @ApiPropertyOptional({
        description: 'Updated name of the service. Names are not unique for each service.',
        example: 'SUD v1.1 (Auto-punctuator)',
    })
    name: string

    @ApiPropertyOptional({
        description: 'Update the unique identifier of the service.',
        example: 'v10',
    })
    version: string

    @ApiPropertyOptional({
        description: `New type for the service being updated. Available types are '${Object.values(
            ServiceType,
        ).join(', ')}'.`,
        example: 'SUD',
    })
    type: string

    @ApiPropertyOptional({
        description: 'Updated description of the service',
        example: 'The service allows auto-punctuation of English and Malay sentences.',
    })
    description: string

    @ApiPropertyOptional({
        description:
            "Updated IP address/URL of the service. Must not include a trailing '/''. Include port number if necessary.",
        example: 'https://sud-1.speechlab.sg',
    })
    address: string
}

export class UpdateEndpointSchema {
    @ApiPropertyOptional({
        description: 'Updated unique identifier for the endpoint.',
        example: 'change-lang',
    })
    task: string

    @ApiPropertyOptional({
        description: `Updated HTTP method. Valid methods: ${Object.values(HttpMethodType).join(
            ', ',
        )}.`,
        example: 'GET',
    })
    method: string

    @ApiPropertyOptional({
        description: 'Updated endpoint to be called. Include a leading /.',
        example: '/change_lang',
    })
    endpointPath: string

    @ApiPropertyOptional({
        description:
            'Options required by the endpoint. Options must be stored in <field, type-accepted> pair',
        example: {
            message: 'string',
            isFluency: 'boolean',
            removeAutoCheck: 'boolean',
            passes: 'number',
        },
    })
    options: Record<string, string>

    @ApiPropertyOptional({
        description: `Uploadable formats supported by the endpoint. Valid supported formats are: ${Object.values(
            UploadFormat,
        ).join(', ')}.`,
        example: ['IMAGE', 'AUDIO'],
    })
    supportedFormats: string[]
}

export const RetrieveEndpointSchema = {
    task: {
        name: 'task',
        description:
            'Task name that uniquely identifies the endpoint under the specified service. Task name is case-sensitive.',
        example: 'predict',
    },
}

export class RetrieveEndpointResponseSchema {
    @ApiProperty({
        description: `HTTP method. Available methods are '${Object.values(HttpMethodType).join(
            ', ',
        )}'.`,
        example: 'POST',
    })
    method: string

    @ApiProperty({
        description: "Unique identifier for a service's endpoint. Case-sensitive.",
        example: 'predict',
    })
    task: string

    @ApiPropertyOptional({
        description: 'Identify if the endpoint accepts text-based data or not.',
        example: false,
        default: true,
    })
    textBased: boolean

    @ApiPropertyOptional({
        description: 'Options required by the endpoint. Displayed only if textBased is true.',
        example: {
            message: 'string',
            isFluency: 'boolean',
            removeAutoCheck: 'boolean',
            passes: 'number',
        },
    })
    options: Record<string, string>

    @ApiPropertyOptional({
        description: `Uploadable formats supported by the endpoint. Available formats are '${Object.values(
            UploadFormat,
        ).join(', ')}' Displayed only if textBased is false.`,
        example: ['IMAGE', 'AUDIO'],
    })
    supportedFormats: string[]
}

export const RetrieveEndpointsSchema = {
    method: {
        name: 'method',
        description: `HTTP method. Available methods are '${Object.values(HttpMethodType).join(
            ', ',
        )}'.`,
        required: false,
    },
    task: {
        name: 'task',
        description:
            'Task name that uniquely identifies the endpoint under the specified service. Task name is case-sensitive.',
        example: 'predict',
        required: false,
    },
}

export class RetrieveEndpointsResponseSchema {
    @ApiProperty({
        description: 'Array of endpoints matching the filters.',
        example: [
            {
                method: 'POST',
                task: 'predict',
                options: {
                    passes: 'number',
                    message: 'string',
                },
                textBased: true,
            },
            {
                method: 'POST',
                task: 'upload',
                supportedFormats: ['IMAGE', 'AUDIO'],
                textBased: false,
            },
        ],
    })
    endpoints: RetrieveEndpointResponseSchema[]
}
