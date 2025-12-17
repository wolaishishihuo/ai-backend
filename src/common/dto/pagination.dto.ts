import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    default: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;
}

export class PaginatedResponseDto<T> {
  list: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };

  constructor(data: T[], total: number, page: number, pageSize: number) {
    this.list = data;
    this.meta = {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
}
