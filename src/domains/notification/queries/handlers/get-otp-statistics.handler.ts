import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOtpStatisticsQuery } from '../get-otp-statistics.query';
import { OtpService } from '../../services/otp.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetOtpStatisticsQuery)
export class GetOtpStatisticsHandler implements IQueryHandler<GetOtpStatisticsQuery> {
  constructor(
    private readonly otpService: OtpService,
  ) {}

  async execute(query: GetOtpStatisticsQuery): Promise<any> {
    const result = await this.otpService.getOtpStatistics(
      query.userId ? UuidValueObject.fromString(query.userId) : undefined,
      query.startDate,
      query.endDate
    );

    return result;
  }
}
