import { IsOptional, IsDateString } from 'class-validator';
export class AuditLogStatisticsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;
@IsOptional()
  @IsDateString()
  endDate?: string;
}
