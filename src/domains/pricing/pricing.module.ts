import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PricingService } from './services/pricing.service';
import { CommissionStrategyController } from './controllers/commission-strategy.controller';
import { CommissionStrategyRepositoryInterface } from './interfaces/commission-strategy-repository.interface';
import { PrismaCommissionStrategyRepository } from '../../shared/infrastructure/database/repositories/prisma-commission-strategy.repository';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
// Commands
import { CreateCommissionStrategyHandler } from './commands/handlers/create-commission-strategy.handler';
import { UpdateCommissionStrategyHandler } from './commands/handlers/update-commission-strategy.handler';
import { UpdateCommissionValueHandler } from './commands/handlers/update-commission-value.handler';
import { ActivateCommissionStrategyHandler } from './commands/handlers/activate-commission-strategy.handler';
import { DeactivateCommissionStrategyHandler } from './commands/handlers/deactivate-commission-strategy.handler';
import { DeleteCommissionStrategyHandler } from './commands/handlers/delete-commission-strategy.handler';
// Queries
import { GetCommissionStrategyByIdHandler } from './queries/handlers/get-commission-strategy-by-id.handler';
import { GetCommissionStrategiesHandler } from './queries/handlers/get-commission-strategies.handler';
import { CalculatePricingHandler } from './queries/handlers/calculate-pricing.handler';
import { GetPricingBreakdownHandler } from './queries/handlers/get-pricing-breakdown.handler';
// Events
import { CommissionStrategyCreatedHandler } from './events/handlers/commission-strategy-created.handler';
import { CommissionStrategyUpdatedHandler } from './events/handlers/commission-strategy-updated.handler';
import { CommissionStrategyActivatedHandler } from './events/handlers/commission-strategy-activated.handler';
import { CommissionStrategyDeactivatedHandler } from './events/handlers/commission-strategy-deactivated.handler';
const CommandHandlers = [
  CreateCommissionStrategyHandler,
  UpdateCommissionStrategyHandler,
  UpdateCommissionValueHandler,
  ActivateCommissionStrategyHandler,
  DeactivateCommissionStrategyHandler,
  DeleteCommissionStrategyHandler,
];

const QueryHandlers = [
  GetCommissionStrategyByIdHandler,
  GetCommissionStrategiesHandler,
  CalculatePricingHandler,
  GetPricingBreakdownHandler,
];

const EventHandlers = [
  CommissionStrategyCreatedHandler,
  CommissionStrategyUpdatedHandler,
  CommissionStrategyActivatedHandler,
  CommissionStrategyDeactivatedHandler,
];
@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [CommissionStrategyController],
  providers: [
    PricingService,
    PrismaCommissionStrategyRepository,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    {
      provide: 'CommissionStrategyRepositoryInterface',
      useClass: PrismaCommissionStrategyRepository,
    },
  ],
  exports: [
    CqrsModule,
    PricingService,
    'CommissionStrategyRepositoryInterface',
  ],
})
export class PricingModule {}
