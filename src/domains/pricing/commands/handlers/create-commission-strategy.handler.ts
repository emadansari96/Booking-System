import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCommissionStrategyCommand } from '../create-commission-strategy.command';
import { CommissionStrategyRepositoryInterface } from '../../interfaces/commission-strategy-repository.interface';
import { CommissionStrategyEntity } from '../../entities/commission-strategy.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(CreateCommissionStrategyCommand)
export class CreateCommissionStrategyHandler implements ICommandHandler<CreateCommissionStrategyCommand> {
  constructor(
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
  ) {}

  async execute(command: CreateCommissionStrategyCommand): Promise<CommissionStrategyEntity> {
    // Check if commission strategy with same name already exists
    const existingStrategy = await this.commissionStrategyRepository.findByName(command.name);
    if (existingStrategy) {
      throw new Error(`Commission strategy with name "${command.name}" already exists`);
    }

    // Create commission strategy entity
    const commissionStrategy = CommissionStrategyEntity.create(
      UuidValueObject.generate(),
      command.name,
      command.type,
      command.value,
      command.description,
      command.priority,
      command.applicableResourceTypes,
      command.minBookingDuration,
      command.maxBookingDuration
    );

    // Save commission strategy
    const savedStrategy = await this.commissionStrategyRepository.save(commissionStrategy);

    return savedStrategy;
  }
}
