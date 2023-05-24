import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class InsertUserSchema {
    @ApiProperty()
    username: string

    @ApiProperty()
    password: string

    @ApiProperty()
    name: string

    @ApiProperty()
    email: string

    @ApiPropertyOptional()
    department: string
}

export class LoginUserSchema {
    @ApiProperty()
    username: string

    @ApiProperty()
    password: string
}

export class RemoveUserSchema {
    @ApiPropertyOptional()
    username: string
}

export class UpdateUserSchema {
    @ApiProperty()
    oldUsername: string

    @ApiPropertyOptional()
    newUsername: string

    @ApiPropertyOptional()
    email: string

    @ApiPropertyOptional()
    password: string

    @ApiPropertyOptional()
    department: string

    @ApiPropertyOptional()
    name: string
}

export class ExtendSubscriptionSchema {
    @ApiProperty()
    username: string

    @ApiProperty()
    extension: number
}