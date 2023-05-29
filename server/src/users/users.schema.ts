import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class InsertUserSchema {
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
