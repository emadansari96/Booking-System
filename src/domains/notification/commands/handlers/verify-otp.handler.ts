import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyOtpCommand } from '../verify-otp.command';
import { OtpService } from '../../services/otp.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@CommandHandler(VerifyOtpCommand)
export class VerifyOtpHandler implements ICommandHandler<VerifyOtpCommand> {
  constructor(
    private readonly otpService: OtpService,
  ) {}

  async execute(command: VerifyOtpCommand): Promise<any> {
    const result = await this.otpService.verifyOtp({
      userId: UuidValueObject.fromString(command.userId),
      email: command.email,
      code: command.code,
      type: command.type,
    });

    return result;
  }
}
