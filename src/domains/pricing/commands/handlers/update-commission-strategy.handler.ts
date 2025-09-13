import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateCommissionStrategyCommand } from '../update-commission-strategy.command';
import { CommissionStrategyRepositoryInterface } from '../../interfaces/commission-strategy-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(UpdateCommissionStrategyCommand)
export class UpdateCommissionStrategyHandler implements ICommandHandler<UpdateCommissionStrategyCommand> {
  constructor(
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
  ) {}

  async execute(command: UpdateCommissionStrategyCommand): Promise<void> {
    const id = UuidValueObject.fromString(command.id);
    
    // Find commission strategy
    const commissionStrategy = await this.commissionStrategyRepository.findById(id);
    if (!commissionStrategy) {
      throw new Error(`Commission strategy with id "${command.id}" not found`);
    }

    // Check if name is being changed and if it already exists
    if (command.name && command.name !== commissionStrategy.name.value) {
      const existingStrategy = await this.commissionStrategyRepository.findByName(command.name);
      if (existingStrategy) {
        throw new Error(`Commission strategy with name "${command.name}" already exists`);
      }
    }

    // Update commission strategy
    commissionStrategy.updateDetails(
      command.name,
      command.description,
      command.priority,
      command.applicableResourceTypes,
      command.minBookingDuration,
      command.maxBookingDuration
    );

    // Save updated commission strategy
    await this.commissionStrategyRepository.save(commissionStrategy);
  }
}
