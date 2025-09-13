import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ActivateCommissionStrategyCommand } from '../activate-commission-strategy.command';
import { CommissionStrategyRepositoryInterface } from '../../interfaces/commission-strategy-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@CommandHandler(ActivateCommissionStrategyCommand)
export class ActivateCommissionStrategyHandler implements ICommandHandler<ActivateCommissionStrategyCommand> {
  constructor(
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
  ) {}

  async execute(command: ActivateCommissionStrategyCommand): Promise<void> {
    const id = UuidValueObject.fromString(command.id);
    
    // Find commission strategy
    const commissionStrategy = await this.commissionStrategyRepository.findById(id);
    if (!commissionStrategy) {
      throw new Error(`Commission strategy with id "${command.id}" not found`);
    }

    // Activate commission strategy
    commissionStrategy.activate();

    // Save updated commission strategy
    await this.commissionStrategyRepository.save(commissionStrategy);
  }
}
