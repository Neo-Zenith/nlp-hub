import { ApiProperty } from '@nestjs/swagger'

export class BadRequestSchema {
    @ApiProperty({
        description: 'HTTP status code for BAD REQUEST.',
        example: '400',
    })
    statusCode: string

    @ApiProperty({
        description: 'Explanation of the bad request made.',
        example: 'This message details what is wrong with the request given.',
    })
    message: string
}

export class NotFoundSchema {
    @ApiProperty({
        description: 'HTTP status code for NOT FOUND.',
        example: '404',
    })
    statusCode: string

    @ApiProperty({
        description: 'Explanation of the invalid resource.',
        example: 'This message details what resource could not be located.',
    })
    message: string
}

export class ConflictSchema {
    @ApiProperty({
        description: 'HTTP status code for CONFLICT.',
        example: '409',
    })
    statusCode: string

    @ApiProperty({
        description: 'Explanation of the conflicting resource.',
        example: 'This message details what resource has conflicting properties.',
    })
    message: string
}

export class UnauthorizedSchema {
    @ApiProperty({
        description: 'HTTP status code for UNAUTHORIZED.',
        example: '401',
    })
    statusCode: string

    @ApiProperty({
        description: 'Explanation of why server could not authenticate user.',
        example: 'This message details what is missing that prevents authentication.',
    })
    message: string
}

export class ForbiddenSchema {
    @ApiProperty({
        description: 'HTTP status code for FORBIDDEN.',
        example: '403',
    })
    statusCode: string

    @ApiProperty({
        description: 'Explanation of why user is denied reequest.',
        example: 'This message details why user is denied reequest.',
    })
    message: string
}

export class ServerMessageSchema {
    @ApiProperty({
        description: 'Message returned by server.',
        example: 'This message is returned by the server.',
    })
    message: string
}
