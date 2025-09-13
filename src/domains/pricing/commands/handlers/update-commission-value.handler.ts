import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateCommissionValueCommand } from '../update-commission-value.command';
import { CommissionStrategyRepositoryInterface } from '../../interfaces/commission-strategy-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@CommandHandler(UpdateCommissionValueCommand)
export class UpdateCommissionValueHandler implements ICommandHandler<UpdateCommissionValueCommand> {
  constructor(
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
  ) {}

  async execute(command: UpdateCommissionValueCommand): Promise<void> {
    const id = UuidValueObject.fromString(command.id);
    
    // Find commission strategy
    const commissionStrategy = await this.commissionStrategyRepository.findById(id);
    if (!commissionStrategy) {
      throw new Error(`Commission strategy with id "${command.id}" not found`);
    }

    // Update commission value
    commissionStrategy.updateCommission(command.type, command.value);

    // Save updated commission strategy
    await this.commissionStrategyRepository.save(commissionStrategy);
  }
}
