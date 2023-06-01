import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserSchema {
    @ApiProperty({
        description: 'Username for the user. Usernames are unique for each user.',
        example: 'User01',
    })
    username: string

    @ApiProperty({
        description: 'Password for the user. Password must be minimum 8 characters long.',
        example: 'password123',
    })
    password: string

    @ApiProperty({
        description: 'Name of the user.',
        example: 'John Doe',
    })
    name: string

    @ApiProperty({
        description: 'Email of the user. Emails are unique for each user.',
        example: 'test@example.com',
    })
    email: string

    @ApiPropertyOptional({
        description: 'Department of the user.',
        example: 'SCSE',
    })
    department: string
}

export class LoginUserSchema {
    @ApiProperty({
        description: 'Username for the user. Case sensitive.',
        example: 'User01',
    })
    username: string

    @ApiProperty({
        description: 'Password for the user. Case sensitive.',
        example: 'password123',
    })
    password: string
}

export class LoginUserResponseSchema {
    @ApiProperty({
        description: 'Access token to be included in request headers for future authentication.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXRhIF0IjDU2MTA5NjF9.J0Xk82s2lD...',
    })
    accessToken: string
}

export class UpdateUserSchema {
    @ApiPropertyOptional({
        description: 'New username for the user. Case sensitive.',
        example: 'User02',
    })
    username: string

    @ApiPropertyOptional({
        description: 'New email for the user. Case sensitive.',
        example: 'test2@example.com',
    })
    email: string

    @ApiPropertyOptional({
        description: 'New password for the user. Must be minimum 8 characters long.',
        example: 'password456',
    })
    password: string

    @ApiPropertyOptional({
        description: 'Updated department for the user.',
        example: 'MAE',
    })
    department: string

    @ApiPropertyOptional({
        description: 'Updated name for the user.',
        example: 'John Smith',
    })
    name: string
}

export class ExtendSubscriptionSchema {
    @ApiProperty({
        description:
            "Extends a user's subscription period. Must be a positive integer in string literal.",
        example: '30',
    })
    extension: string
}

export const RetrieveUserSchema = {
    username: {
        name: 'username',
        description: 'Username of the user. Username is case-sensitive.',
    },
}

export class RetreiveUserResponse {
    @ApiProperty({
        description: 'Username of the user.',
        example: 'User001',
    })
    username: string

    @ApiProperty({
        description: 'Email of the user.',
        example: 'test@example.com',
    })
    email: string

    @ApiProperty({
        description: 'Department of the user.',
        example: 'SCSE',
    })
    department: string

    @ApiProperty({
        description: 'Indicates when will the user subscription expires in UTC.',
        example: '2023-12-31T08:30:00:000Z',
    })
    subscriptionExpiryDate: string
}

export const RetrieveUsersSchema = {
    department: {
        name: 'department',
        required: false,
        description:
            'Returns all users matching the department provided. Department is case-sensitive and only full-string match results are returned.',
    },
    name: {
        name: 'name',
        required: false,
        description:
            'Returns all users matching the name provided. Name is case-sensitive and only full-string match results are returned.',
    },
    expireIn: {
        name: 'expireIn',
        required: false,
        description:
            'Returns all users with subscription expiring no later than current date + expireIn. Must be a positive integer.',
    },
}

export class RetrieveUsersResponseSchema {
    @ApiProperty({
        description: 'Array of users matching the filters.',
        example: [
            {
                username: 'User01',
                name: 'John Smith',
                email: 'john@email.com',
                department: 'SCSE',
                subscriptionExpiryDate: '2023-12-31T08:30:00:000Z',
            },
            {
                username: 'User02',
                name: 'John Doe',
                email: 'john2@email.com',
                department: 'MAE',
                subscriptionExpiryDate: '2023-05-31T08:30:00:000Z',
            },
        ],
    })
    users: RetreiveUserResponse[]
}
