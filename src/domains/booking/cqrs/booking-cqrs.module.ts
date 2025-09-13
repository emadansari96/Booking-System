import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Command Handlers
import { CreateBookingHandler } from '../commands/handlers/create-booking.handler';
import { ConfirmBookingHandler } from '../commands/handlers/confirm-booking.handler';
import { CancelBookingHandler } from '../commands/handlers/cancel-booking.handler';
import { CompleteBookingHandler } from '../commands/handlers/complete-booking.handler';
import { ExpireBookingHandler } from '../commands/handlers/expire-booking.handler';
import { ProcessBookingPaymentHandler } from '../commands/handlers/process-booking-payment.handler';

// Query Handlers
import { GetBookingByIdHandler } from '../queries/handlers/get-booking-by-id.handler';
import { GetBookingsHandler } from '../queries/handlers/get-bookings.handler';
import { CheckBookingAvailabilityHandler } from '../queries/handlers/check-booking-availability.handler';
import { GetBookingStatisticsHandler } from '../queries/handlers/get-booking-statistics.handler';

// Services
import { BookingService } from '../services/booking.service';
import { RedisLockService } from '../../../shared/infrastructure/redis/redis-lock.service';
import { AuditLogService } from '../../audit-log/services/audit-log.service';

// Repositories
import { PrismaBookingRepository } from '../../../shared/infrastructure/database/repositories/prisma-booking.repository';
import { BookingRepositoryInterface } from '../interfaces/booking-repository.interface';

@Module({
  imports: [CqrsModule],
  providers: [
    // Services
    BookingService,
    RedisLockService,
    AuditLogService,
    
    // Repositories
    PrismaBookingRepository,
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
  ],
  exports: [
    BookingService,
    'BookingRepositoryInterface',
  ],
})
export class BookingCqrsModule {}
