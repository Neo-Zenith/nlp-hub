import { MethodTypes, NlpTypes } from "./nlp.model";

export const insertServiceSchema = {
    required: ['name', 'version', 'address', 'type', 'endpoints'],
    properties: {
        'name': { 
            type: 'string', 
            description: 'Name of the service. Names are not unique to services.',
            example: 'SUD Auto-punctuator' 
        },
        'version': { 
            type: 'string', 
            description: 'Version of the service. Avoid any non-numeric characters.',
            example: '1.0' 
        },
        'description': { 
            type: 'string', 
            description: 'Description of the service.',
            example: 'This service auto-punctuates English sentences' },
        'address': { 
            type: 'string', 
            description: 'IP address/URL of the service. Include port number if necessary. No trailing backslash is allowed.',
            example: '192.168.0.1:3000' 
        },
        'type': { 
            type: 'string', 
            description: `Service type. Valid types are: ${Object.values(NlpTypes).join(', ').toString()}`,
            example: 'SUD' 
        },
        'endpoints': { 
            type: 'array', 
            description: 'Endpoints provided by the service.',
            items: {
                type: 'object',
                required: ['method', 'endpointPath', 'task'],
                properties: {
                    'task': { 
                        type: 'string',
                        description: 'Task associated with the endpoint for the service.', 
                        example: 'Predict'
                    },
                    'method': { 
                        type: 'string',
                        description: `HTTP method. Valid methods are: ${Object.values(MethodTypes).join(', ').toString()}.`, 
                        example: 'POST'
                    },
                    'endpointPath': { 
                        type: 'string', 
                        description: 'Endpoint path. Must include a leading backslash',
                        example: '/predict'
                    },
                    'options': { 
                        type: 'object', 
                        description: 'Option fields required by the endpoint. Key-value pair must be in the form <option, type>',
                        example: {
                            'option1': 'string',
                            'option2': 'boolean'
                        } 
                    }
                }
            }
        }
    }
}

export const updateServiceSchema = {
    required: ['id'],
    properties: {
        'id': { 
            type: 'string',
            description: 'ID must be a valid 12-byte string.',
            example: '5467443817296ad01d46a430'
        },
        'name': { 
            type: 'string', 
            description: 'New name of the service. Names are not unique to services',
            example: 'SUD Auto-punctuator' 
        },
        'version': { 
            type: 'string', 
            description: 'New version of the service. Avoid any non-numeric characters.',
            example: '1.0' 
        },
        'description': { 
            type: 'string', 
            description: 'New description of the service.',
            example: 'This service auto-punctuates English sentences.' 
        },
        'address': { 
            type: 'string', 
            description: 'New IP address/URL of the service. include port number if necessary.',
            example: '192.168.0.1:3000' 
        },
        'type': { 
            type: 'string', 
            description: `New service type. Valid types are: ${Object.values(NlpTypes).join(', ').toString()}`,
            example: 'SUD' 
        }
    }
}

export const serviceResponseSchema = {
    properties: {
        'id': {
            type: 'string',
            description: 'ID of the service.',
            example: '5467443817296ad01d46a430'
        },
        'name': {
            type: 'string',
            description: 'Name of the service.',
            example: 'SUD (Auto-punctuator)'
        },
        'version': {
            type: 'string',
            description: 'Version of the service.',
            example: '1.0'
        },
        'description': {
            type: 'string',
            description: 'Description of the service.',
            example: 'This service can auto-punctuate all English sentences'
        },
        'type': {
            type: 'string',
            description: `Service type. Valid types are ${Object.values(NlpTypes).join(', ').toString()}`,
            example: 'SUD'
        }
    }
}

export const addEndpointSchema = {
    required: ['serviceID', 'method', 'endpointPath', 'task'],
    properties: {
        'serviceID': { 
            type: 'string',
            description: 'ID must be a valid 12-byte string.',
            example: '5467443817296ad01d46a430' 
        },
        'method': { 
            type: 'string',
            description: `HTTP method. Valid methods are ${Object.values(MethodTypes).join(', ').toString()}.`, 
            example: 'POST' 
        },
        'endpointPath': { 
            type: 'string', 
            description: 'Endpoint path. Must include a leading backslash.',
            example: '/predict'
        },
        'task': { 
            type: 'string',
            description: 'Task associated with the endpoint for the service.', 
            example: 'Predict'
        },
        'options': { 
            type: 'object', 
            description: 'Option fields required by the endpoint. Key-value pair must be in the form <option, type>.',
            example: {
                'option1': 'string',
                'option2': 'boolean'
            } 
        }
    }
}

export const updateEndpointSchema = {
    required: ['id'],
    properties: {
        'id': {
            type: 'string',
            description: 'ID must be a valid 12-byte string.',
            example: '5467443817296ad01d46a430'
        },
        'serviceID': { 
            type: 'string',
            description: 'ID must be a valid 12-byte string.',
            example: '5467443817296ad01d46a430'
        },
        'method': { 
            type: 'string',
            description: `New HTTP method. Valid methods are ${Object.values(MethodTypes).join(', ').toString()}.`, 
            example: 'POST' 
        },
        'endpointPath': { 
            type: 'string', 
            description: 'New endpoint path. Must include a leading backslash.',
            example: '/predict'
        },
        'options': { 
            type: 'object', 
            description: 'New option fields required by the endpoint. Key-value pair must be in the form <option, type>.',
            example: {
                'option1': 'string',
                'option2': 'boolean'
            } 
        }
    }
}

export const endpointResponseSchema = {
    properties: {
        'id': {
            type: 'string',
            description: 'ID of the endpoint',
            example: '5467443817296ad01d46a430'
        },
        'serviceID': {
            type: 'string',
            description: 'ID of the service providing the endpoint',
            example: '5467443817296ad01d46a430'
        },
        'task': {
            type: 'string',
            description: 'Task corresponding to the endpoint',
            example: 'Predict'
        },
        'method': {
            type: 'string',
            description: `HTTP method. Valid methods are ${Object.values(MethodTypes).join(', ').toString()}.`,
            example: 'POST'
        },
        'options': {
            type: 'object',
            description: 'Option fields required by the endpoint.',
            example: {
                'option1': 'option1',
                'option2': 'option2'
            }
        }
    }
}


