import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class InsertEndpointSchema {
    @ApiProperty()
    method: string;

    @ApiProperty()
    endpointPath: string;

    @ApiProperty()
    task: string;

    @ApiPropertyOptional()
    options: Record<string, string>
}

export class InsertServiceSchema {
    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    description: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    address: string;

    @ApiProperty({ type: [InsertEndpointSchema] })
    endpoints: InsertEndpointSchema[];
}

export class UpdateServiceSchema {
    @ApiProperty()
    oldType: string

    @ApiProperty()
    oldVersion: string

    @ApiPropertyOptional()
    name: string

    @ApiPropertyOptional()
    newVersion: string

    @ApiPropertyOptional()
    newType: string

    @ApiPropertyOptional()
    description: string

    @ApiPropertyOptional()
    address: string
}

export class RemoveServiceSchema {
    @ApiProperty()
    type: string

    @ApiProperty()
    version: string
}

export class RemoveEndpointSchema {
    @ApiProperty()
    task: string
}

export class UpdateEndpointSchema {
    @ApiProperty()
    oldTask: string

    @ApiPropertyOptional()
    newTask: string

    @ApiPropertyOptional()
    method: string

    @ApiPropertyOptional()
    endpointPath: string

    @ApiPropertyOptional()
    options: string
}