import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../../../shared/infrastructure/database/database.module';
import { RedisModule } from '../../../shared/infrastructure/redis/redis.module';
import { AuditLogCqrsModule } from '../../audit-log/cqrs/audit-log-cqrs.module';
import { PricingModule } from '../../pricing/pricing.module';
import { PaymentModule } from '../../payment/payment.module';
import { NotificationModule } from '../../notification/notification.module';
// Commands
import { CreateBookingHandler } from '../commands/handlers/create-booking.handler';
import { ConfirmBookingHandler } from '../commands/handlers/confirm-booking.handler';
import { CancelBookingHandler } from '../commands/handlers/cancel-booking.handler';
import { CompleteBookingHandler } from '../commands/handlers/complete-booking.handler';
import { ExpireBookingHandler } from '../commands/handlers/expire-booking.handler';
import { ProcessBookingPaymentHandler } from '../commands/handlers/process-booking-payment.handler';
// Queries
import { GetBookingByIdHandler } from '../queries/handlers/get-booking-by-id.handler';
import { GetBookingsHandler } from '../queries/handlers/get-bookings.handler';
import { CheckBookingAvailabilityHandler } from '../queries/handlers/check-booking-availability.handler';
import { GetBookingStatisticsHandler } from '../queries/handlers/get-booking-statistics.handler';
// Events
import { BookingCreatedHandler } from '../events/handlers/booking-created.handler';
import { BookingConfirmedHandler } from '../events/handlers/booking-confirmed.handler';
import { BookingCancelledHandler } from '../events/handlers/booking-cancelled.handler';
import { BookingCompletedHandler } from '../events/handlers/booking-completed.handler';
import { BookingExpiredHandler } from '../events/handlers/booking-expired.handler';
// Buses - Using NestJS CQRS built-in buses
import { CommandBus, QueryBus, EventBus } from '@nestjs/cqrs';
// Services
import { BookingService } from '../services/booking.service';
import { PrismaBookingRepository } from '../../../shared/infrastructure/database/repositories/prisma-booking.repository';
import { RedisLockService } from '../../../shared/infrastructure/redis/redis-lock.service';
import { AuditLogService } from '../../audit-log/services/audit-log.service';
@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    RedisModule,
    AuditLogCqrsModule,
    PricingModule,
    PaymentModule,
    NotificationModule,
  ],
  providers: [
    // Services
    BookingService,
    PrismaBookingRepository,
    RedisLockService,
    AuditLogService,
    {
      provide: 'BookingRepositoryInterface',
      useClass: PrismaBookingRepository,
    },

    // Command Handlers
    CreateBookingHandler,
    ConfirmBookingHandler,
    CancelBookingHandler,
    CompleteBookingHandler,
    ExpireBookingHandler,
    ProcessBookingPaymentHandler,

    // Query Handlers
    GetBookingByIdHandler,
    GetBookingsHandler,
    CheckBookingAvailabilityHandler,
    GetBookingStatisticsHandler,

    // Event Handlers
    BookingCreatedHandler,
    BookingConfirmedHandler,
    BookingCancelledHandler,
    BookingCompletedHandler,
    BookingExpiredHandler,

    // Buses are provided by CqrsModule
  ],
  exports: [CqrsModule],
})
export class BookingCqrsModule {}