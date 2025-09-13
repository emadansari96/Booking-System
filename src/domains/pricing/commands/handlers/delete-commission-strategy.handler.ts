import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteCommissionStrategyCommand } from '../delete-commission-strategy.command';
import { CommissionStrategyRepositoryInterface } from '../../interfaces/commission-strategy-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(DeleteCommissionStrategyCommand)
export class DeleteCommissionStrategyHandler implements ICommandHandler<DeleteCommissionStrategyCommand> {
  constructor(
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
  ) {}

  async execute(command: DeleteCommissionStrategyCommand): Promise<void> {
    const id = UuidValueObject.fromString(command.id);
    
    // Check if commission strategy exists
    const commissionStrategy = await this.commissionStrategyRepository.findById(id);
    if (!commissionStrategy) {
      throw new Error(`Commission strategy with id "${command.id}" not found`);
    }

    // Delete commission strategy
    await this.commissionStrategyRepository.delete(id);
  }
}
