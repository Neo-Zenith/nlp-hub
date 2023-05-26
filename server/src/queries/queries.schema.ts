import { ApiPropertyOptional } from "@nestjs/swagger";

export class ServiceQuerySchema {
    @ApiPropertyOptional({
        description: 'Options required by the endpoint. Option fields must match the pre-defined options provided by the endpoint.',
        example: {
            'message': 'This is a test message',
            'isFluency': true,
            'removeAutoCheck': false,
            'passes': 0
        }
    })
    options: Record<string, string>
}