export const httpException = {
    properties: {
        'statusCode': {
            type: 'number',
            description: 'HTTP status code',
            example: 400
        },
        'message': {
            type: 'string',
            description: 'Message corresponding to the status code',
            example: 'Invalid service ID format'
        }
    }
}