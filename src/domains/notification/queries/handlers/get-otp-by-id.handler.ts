import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetOtpByIdQuery } from '../get-otp-by-id.query';
import { OtpRepositoryInterface } from '../../interfaces/otp-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetOtpByIdQuery)
export class GetOtpByIdHandler implements IQueryHandler<GetOtpByIdQuery> {
  constructor(
    @Inject('OtpRepositoryInterface')
    private readonly otpRepository: OtpRepositoryInterface,
  ) {}

  async execute(query: GetOtpByIdQuery): Promise<any> {
    const otp = await this.otpRepository.findById(
      UuidValueObject.fromString(query.otpId)
    );

    return otp;
  }
}
