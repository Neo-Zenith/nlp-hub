import { ApiPropertyOptional } from "@nestjs/swagger";

export class ServiceQuerySchema {
    @ApiPropertyOptional()
    options: Record<string, string>
}