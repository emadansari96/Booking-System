import { Module } from '@nestjs/common';
import { ExpiryService } from './services/expiry.service';
import { InvoiceRepositoryInterface } from '../payment/interfaces/invoice-repository.interface';
import { BookingRepositoryInterface } from '../booking/interfaces/booking-repository.interface';
import { PrismaInvoiceRepository } from '../../shared/infrastructure/database/repositories/prisma-invoice.repository';
import { PrismaBookingRepository } from '../../shared/infrastructure/database/repositories/prisma-booking.repository';
import { AuditLogService } from '../audit-log/services/audit-log.service';
import { NotificationService } from '../notification/services/notification.service';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { NotificationModule } from '../notification/notification.module';
import { EmailModule } from '../../shared/infrastructure/email/email.module';
@Module({
  imports: [DatabaseModule, AuditLogModule, NotificationModule, EmailModule],
  providers: [
    ExpiryService,
    {
      provide: 'InvoiceRepositoryInterface',
      useClass: PrismaInvoiceRepository,
    },
    {
      provide: 'BookingRepositoryInterface',
      useClass: PrismaBookingRepository,
    },
    AuditLogService,
    NotificationService,
  ],
  exports: [ExpiryService],
})
export class ExpiryModule {}
