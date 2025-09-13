// src/shared/infrastructure/database/database.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaResourceRepository } from './repositories/prisma-resource.repository';
import { PrismaResourceItemRepository } from './repositories/prisma-resource-item.repository';
import { PrismaCommissionStrategyRepository } from './repositories/prisma-commission-strategy.repository';
import { PrismaPaymentRepository } from './repositories/prisma-payment.repository';
import { PrismaInvoiceRepository } from './repositories/prisma-invoice.repository';
import { PrismaNotificationRepository } from './repositories/prisma-notification.repository';
import { PrismaOtpRepository } from './repositories/prisma-otp.repository';
import { PrismaBookingRepository } from './repositories/prisma-booking.repository';
import { HashingService } from '../security/hashing.service';
@Module({
  providers: [
    PrismaService,
    PrismaUserRepository,
    PrismaResourceRepository,
    PrismaResourceItemRepository,
    PrismaCommissionStrategyRepository,
    PrismaPaymentRepository,
    PrismaInvoiceRepository,
    PrismaNotificationRepository,
    PrismaOtpRepository,
    PrismaBookingRepository,
    HashingService,
    {
      provide: 'UserRepositoryInterface',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'ResourceRepositoryInterface',
      useClass: PrismaResourceRepository,
    },
    {
      provide: 'ResourceItemRepositoryInterface',
      useClass: PrismaResourceItemRepository,
    },
    {
      provide: 'CommissionStrategyRepositoryInterface',
      useClass: PrismaCommissionStrategyRepository,
    },
    {
      provide: 'PaymentRepositoryInterface',
      useClass: PrismaPaymentRepository,
    },
    {
      provide: 'InvoiceRepositoryInterface',
      useClass: PrismaInvoiceRepository,
    },
    {
      provide: 'NotificationRepositoryInterface',
      useClass: PrismaNotificationRepository,
    },
    {
      provide: 'OtpRepositoryInterface',
      useClass: PrismaOtpRepository,
    },
    {
      provide: 'BookingRepositoryInterface',
      useClass: PrismaBookingRepository,
    },
  ],
  exports: [
    PrismaService,
    PrismaUserRepository,
    PrismaResourceRepository,
    PrismaResourceItemRepository,
    PrismaCommissionStrategyRepository,
    PrismaPaymentRepository,
    PrismaInvoiceRepository,
    PrismaNotificationRepository,
    PrismaOtpRepository,
    PrismaBookingRepository,
    HashingService,
    'UserRepositoryInterface',
    'ResourceRepositoryInterface',
    'ResourceItemRepositoryInterface',
    'CommissionStrategyRepositoryInterface',
    'PaymentRepositoryInterface',
    'InvoiceRepositoryInterface',
    'NotificationRepositoryInterface',
    'OtpRepositoryInterface',
    'BookingRepositoryInterface',
  ]
})
export class DatabaseModule {}