import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkOtpUsedCommand } from '../mark-otp-used.command';
import { OtpService } from '../../services/otp.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@CommandHandler(MarkOtpUsedCommand)
export class MarkOtpUsedHandler implements ICommandHandler<MarkOtpUsedCommand> {
  constructor(
    private readonly otpService: OtpService,
  ) {}

  async execute(command: MarkOtpUsedCommand): Promise<any> {
    const result = await this.otpService.markOtpAsUsed(
      UuidValueObject.fromString(command.otpId)
    );

    return result;
  }
}
