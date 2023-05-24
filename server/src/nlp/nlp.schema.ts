import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { MethodTypes, NlpTypes } from './nlp.model';

export class InsertEndpointSchema {
    @ApiProperty({
        description: `HTTP method. Valid methods: ${Object.values(MethodTypes).join(', ')}.`,
        example: 'POST'
    })
    method: string;

    @ApiProperty({
        description: 'Endpoint to be called. Include a leading /.',
        example: '/predict'
    })
    endpointPath: string;

    @ApiProperty({
        description: "Unique identifier for a service's endpoint. Case-sensitive.",
        example: 'predict'
    })
    task: string;

    @ApiPropertyOptional({
        description: 'Options required by the endpoint. Option fields must match the pre-defined options provided by the endpoint.',
        example: {
            'message': 'This is a test message',
            'isFluency': true,
            'removeAutoCheck': false,
            'passes': 0
        }
    })
    options: Record<string, string>
}

export class InsertServiceSchema {
    @ApiProperty({
        description: 'Name of the service. Name is not unique for services. Case-sensitive.',
        example: "SUD v1.0 (Auto-punctuator)"
    })
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the service (brief summary of what the service provides).',
        example: "This service is capable of auto-punctuating English sentences."
    })
    description: string;

    @ApiProperty({
        description: `Type of service. Valid types: ${Object.values(NlpTypes).join(', ')}.`,
        example: 'SUD'
    })
    type: string;

    @ApiProperty({
        description: 'IP address/URL of the service. Address is unique for each service. Must not include a trailing /. Include port number if necessary.',
        example: "https://sud.speechlab.sg"
    })
    address: string;

    @ApiProperty({ 
        type: [InsertEndpointSchema],
        description: 'Array of endpoints provided by the service' 
    })
    endpoints: InsertEndpointSchema[];
}

export class UpdateServiceSchema {
    @ApiProperty({
        description: `Type of the service to be updated. Valid types: ${Object.values(NlpTypes).join(', ')}.`,
        example: "NER"
    })
    oldType: string

    @ApiProperty({
        description: 'Unique identifier for a service under a service type. Format is v{id}.',
        example: 'v11'
    })
    oldVersion: string

    @ApiPropertyOptional({
        description: 'Updated name of the service. Names are not unique for each service.',
        example: 'SUD v1.1 (Auto-punctuator)'
    })
    name: string

    @ApiPropertyOptional({
        description: 'Update the unique identifier of the service.',
        example: 'v10'
    })
    newVersion: string

    @ApiPropertyOptional({
        description: `New type for the service being updated. Valid types: ${Object.values(NlpTypes).join(', ')}.`,
        example: 'SUD'
    })
    newType: string

    @ApiPropertyOptional({
        description: 'Updated description of the service',
        example: "The service allows auto-punctuation of English and Malay sentences."
    })
    description: string

    @ApiPropertyOptional({
        description: 'Updated IP address/URL of the service. Must not include a trailing /. Include port number if necessary.',
        example: 'https://sud-1.speechlab.sg'
    })
    address: string
}

export class RemoveServiceSchema {
    @ApiProperty({
        description: `Type of the service to be removed. Valid types: ${Object.values(NlpTypes).join(', ')}.`,
        example: 'SUD'
    })
    type: string

    @ApiProperty({
        description: 'Unique identifier for a service under a service type. Format is v{id}.',
        example: 'v10'
    })
    version: string
}

export class RemoveEndpointSchema {
    @ApiProperty({
        description: 'Unique identifier for an endpoint of a service.',
        example: 'predict'
    })
    task: string
}

export class UpdateEndpointSchema {
    @ApiProperty({
        description: 'Unique identifier for the endpoint of a service to be updated.',
        example: 'predict'
    })
    oldTask: string

    @ApiPropertyOptional({
        description: 'Updated unique identifier for the endpoint.',
        example: 'change-lang'
    })
    newTask: string

    @ApiPropertyOptional({
        description: `Updated HTTP method. Valid methods: ${Object.values(MethodTypes).join(', ')}.`,
        example: 'GET'
    })
    method: string

    @ApiPropertyOptional({
        description: 'Updated endpoint to be called. Include a leading /.',
        example: '/change_lang'
    })
    endpointPath: string;

    @ApiPropertyOptional({
        description: 'Updated options required by the endpoint. Option fields must match the pre-defined options provided by the endpoint.',
        example: {
            'message': 'This is the 2nd test message',
            'removeAutoCheck': false,
            'passes': 0,
            'scramble': false
        }
    })
    options: Record<string, string>
}