export const httpExceptionSchema = {
    properties: {
        'statusCode': {
            type: 'number',
            description: 'HTTP status code',
            example: 400
        },
        'message': {
            type: 'string',
            description: 'Message corresponding to the HTTP status code',
            example: 'Invalid service ID format'
        }
    }
}

export const serverMessageResponseSchema = {
    properties: {
        'message': {
            type: 'string',
            description: 'Message from the server.',
            example: 'Service updated'
        }
    }
}

export const IDRequestSchema = {
    required: ['id'],
    properties: {
        'id': {
            type: 'string',
            description: 'ID must be a valid 12-byte string.',
            example: '5467443817296ad01d46a430'
        }
    }
}

export const IDResponseSchema = {
    properties: {
        'id': {
            type: 'string',
            description: '12-byte string corresponding to the resource ID.',
            example: '5467443817296ad01d46a430'
        }
    }
}