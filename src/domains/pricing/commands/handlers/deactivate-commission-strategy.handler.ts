import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeactivateCommissionStrategyCommand } from '../deactivate-commission-strategy.command';
import { CommissionStrategyRepositoryInterface } from '../../interfaces/commission-strategy-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(DeactivateCommissionStrategyCommand)
export class DeactivateCommissionStrategyHandler implements ICommandHandler<DeactivateCommissionStrategyCommand> {
  constructor(
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
  ) {}

  async execute(command: DeactivateCommissionStrategyCommand): Promise<void> {
    const id = UuidValueObject.fromString(command.id);
    
    // Find commission strategy
    const commissionStrategy = await this.commissionStrategyRepository.findById(id);
    if (!commissionStrategy) {
      throw new Error(`Commission strategy with id "${command.id}" not found`);
    }

    // Deactivate commission strategy
    commissionStrategy.deactivate();

    // Save updated commission strategy
    await this.commissionStrategyRepository.save(commissionStrategy);
  }
}
