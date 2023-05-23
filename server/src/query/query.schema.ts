export const querySchema = {
    required: ['serviceID', 'endpointID'],
    properties: {
        'serviceID': { 
            type: 'string',
            description: 'ID must be a valid 12-byte string.',
            example: '54674867bc3fb5168347b088'
        },
        'endpointID': {
            type: 'string',
            description: 'ID must be a valid 12-byte string.',
            example: '54674867bc3fb5168347b088'
        },
        'options': {
            type: 'object',
            description: 'Option field required by the endpoint. Must match options registered under the endpoint.',
            example: {
                'option1': 'option1',
                'option2': 'option2'
            }
        }
    }
}

export const queryOutputSchema = {
    properties: {
        'id': {
            type: 'string',
            description: 'ID of the query made.',
            example: '54674867bc3fb5168347b088'
        },
        'output': {
            type: 'object',
            description: 'Output from the NLP service.',
            example: {
                'prediction': 'Output message.'
            }
        }
    }
}

export const usageResponseSchema = {
    properties: {
        'userID': {
            type: 'string',
            description: 'ID of the user making the query.',
            example: '54674867bc3fb5168347b088'
        },
        'serviceID': {
            type: 'string',
            description: 'ID of the service utilised.',
            example: '54674867bc3fb5168347b088'
        },
        'endpointID': {
            type: 'string',
            description: 'ID of the endpoint of the service called.',
            example: '54674867bc3fb5168347b088'
        },
        'dateTime': {
            type: 'string',
            description: 'Timestamp of the service utilised in ISO 8601 date format.',
            example: '2023-05-19T09:59:03.877Z'
        },
        'output': {
            type: 'string',
            description: 'Output is a JSON object stored as string literals.',
            example: '{\"prediction\":\"This is a test message.\"}'
        },
        'options': {
            type: 'object',
            description: 'Option field required by the endpoint.',
            example: {
                'option1': 'option1',
                'option2': 'option2'
            }
        },
        'serviceDeleted': {
            type: 'boolean',
            description: 'True if service utilised for this query was removed.',
            example: true
        }
    }
}