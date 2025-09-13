import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOtpCommand } from '../create-otp.command';
import { OtpService } from '../../services/otp.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(CreateOtpCommand)
export class CreateOtpHandler implements ICommandHandler<CreateOtpCommand> {
  constructor(
    private readonly otpService: OtpService,
  ) {}

  async execute(command: CreateOtpCommand): Promise<any> {
    const result = await this.otpService.createAndSendOtp({
      userId: UuidValueObject.fromString(command.userId),
      email: command.email,
      type: command.type,
      expiresInMinutes: command.expiresInMinutes,
      maxAttempts: command.maxAttempts,
      metadata: command.metadata,
    });

    return result;
  }
}
