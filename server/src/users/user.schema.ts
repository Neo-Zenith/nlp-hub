export const addUserSchema = {
    required: ['name', 'username', 'email', 'password'],
    properties: {
        'name': { 
            type: 'string',
            description: 'Name of the user',
            example: 'John Doe'
        },
        'username': {
            type: 'string',
            description: 'Username of the user',
            example: 'User01'
        },
        'email': {
            type: 'string',
            description: 'Email of the user',
            example: 'user@example.com'
        },
        'password': {
            type: 'string',
            description: 'Password of the user',
            example: 'password123'
        },
        'department': {
            type: 'string',
            description: 'Department of the user',
            example: 'SCSE'
        }
    }
}

export const userLoginSchema = {
    required: ['username', 'password'],
    properties: {
        'username': {
            type: 'string',
            description: 'Username of the user',
            example: 'User01'
        },
        'password': {
            type: 'string',
            description: 'Password of the user',
            example: 'password123'
        }
    }
}

export const loginResponse = {
    properties: {
        'accessToken': {
            type: 'string',
            description: 'Access token for subsequent authentication',
            example: 'eyJhbGciOiJIUzI1NiIsKnR5cCI6IopXVCJ9.eyJ1c2VybmFtZSI6Ik5lb1plbml0aCIsImlkIjoiNjQ2NWIzZGM0Yjg1MTcxNmY4MThmOTY3Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjg0NzM5MDkxLCJleHAiOiE2ODQ3NDI2OTF9.0gBiSS4cZzBXqe2KHhcy25sL77zsxgUqSkzLr_6rF6s'
        }
    }
}

export const updateUserSchema = {
    required: ['id'],
    properties: {
        'id': {
            type: 'string',
            description: 'ID must be a valid 12-byte string.',
            example: '5467443817296ad01d46a430'
        },
        'username': {
            type: 'string',
            description: 'New username of the user. Usernames are unique to users.',
            example: 'User02'
        },
        'name': {
            type: 'string',
            description: 'New name of the user. Names are not unique to users.',
            example: 'John Smith'
        },
        'email': {
            type: 'string',
            description: 'New email of the user. Emails are unique to users.',
            example: 'test@example.com'
        },
        'password': {
            type: 'string',
            description: 'New password of the user.',
            example: 'password123'
        },
        'department': {
            type: 'string',
            description: 'New department of the user.',
            example: 'MAE'
        }
    }
}

export const updateUserSubscriptionSchema = {
    properties: {
        'userID': {
            type: 'string',
            description: 'ID must be a valid 12-byte string.',
            example: '5467443817296ad01d46a430'
        },
        'extension': {
            type: 'number',
            description: "Number of days to extend a user's subscription.",
            example: 30
        }
    }
}