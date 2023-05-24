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
        description: 'Options required by the endpoint. Options must be stored in <field, type-accepted> pair',
        example: {
            'message': 'string',
            'isFluency': 'boolean',
            'removeAutoCheck': 'boolean',
            'passes': 'number'
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
    @ApiPropertyOptional({
        description: 'Updated name of the service. Names are not unique for each service.',
        example: 'SUD v1.1 (Auto-punctuator)'
    })
    name: string

    @ApiPropertyOptional({
        description: 'Update the unique identifier of the service.',
        example: 'v10'
    })
    version: string

    @ApiPropertyOptional({
        description: `New type for the service being updated. Valid types: ${Object.values(NlpTypes).join(', ')}.`,
        example: 'SUD'
    })
    type: string

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

export class UpdateEndpointSchema {
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
        description: 'Options required by the endpoint. Options must be stored in <field, type-accepted> pair',
        example: {
            'message': 'string',
            'isFluency': 'boolean',
            'removeAutoCheck': 'boolean',
            'passes': 'number'
        }
    })
    options: Record<string, string>
}