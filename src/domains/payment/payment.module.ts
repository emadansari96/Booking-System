import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentController } from './controllers/payment.controller';
import { InvoiceController } from './controllers/invoice.controller';
import { PaymentService } from './services/payment.service';
import { InvoiceService } from './services/invoice.service';
import { PaymentRepositoryInterface } from './interfaces/payment-repository.interface';
import { InvoiceRepositoryInterface } from './interfaces/invoice-repository.interface';
import { PrismaPaymentRepository } from '../../shared/infrastructure/database/repositories/prisma-payment.repository';
import { PrismaInvoiceRepository } from '../../shared/infrastructure/database/repositories/prisma-invoice.repository';
import { PrismaCommissionStrategyRepository } from '../../shared/infrastructure/database/repositories/prisma-commission-strategy.repository';
import { AuditLogService } from '../audit-log/services/audit-log.service';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { AuditLogCqrsModule } from '../audit-log/cqrs/audit-log-cqrs.module';
import { PricingModule } from '../pricing/pricing.module';
import { NotificationModule } from '../notification/notification.module';
// Commands
import { ProcessPaymentHandler } from './commands/handlers/process-payment.handler';
import { ProcessBulkPaymentHandler } from './commands/handlers/process-bulk-payment.handler';
import { ApprovePaymentHandler } from './commands/handlers/approve-payment.handler';
import { RejectPaymentHandler } from './commands/handlers/reject-payment.handler';
import { CompletePaymentHandler } from './commands/handlers/complete-payment.handler';
import { FailPaymentHandler } from './commands/handlers/fail-payment.handler';
import { CancelPaymentHandler } from './commands/handlers/cancel-payment.handler';
import { RefundPaymentHandler } from './commands/handlers/refund-payment.handler';
import { PayInvoiceHandler } from './commands/handlers/pay-invoice.handler';
import { CancelInvoiceHandler } from './commands/handlers/cancel-invoice.handler';
// Queries
import { GetPaymentByIdHandler } from './queries/handlers/get-payment-by-id.handler';
import { GetPaymentsHandler } from './queries/handlers/get-payments.handler';
import { GetPaymentSummaryHandler } from './queries/handlers/get-payment-summary.handler';
import { GetInvoiceByIdHandler } from './queries/handlers/get-invoice-by-id.handler';
import { GetInvoicesHandler } from './queries/handlers/get-invoices.handler';
// Events
import { PaymentCreatedHandler } from './events/handlers/payment-created.handler';
import { PaymentStatusChangedHandler } from './events/handlers/payment-status-changed.handler';
import { PaymentApprovedHandler } from './events/handlers/payment-approved.handler';
import { PaymentCompletedHandler } from './events/handlers/payment-completed.handler';
import { PaymentFailedHandler } from './events/handlers/payment-failed.handler';
import { PaymentCancelledHandler } from './events/handlers/payment-cancelled.handler';
import { PaymentRefundedHandler } from './events/handlers/payment-refunded.handler';
import { InvoiceCreatedHandler } from './events/handlers/invoice-created.handler';
import { InvoiceStatusChangedHandler } from './events/handlers/invoice-status-changed.handler';
import { InvoicePaidHandler } from './events/handlers/invoice-paid.handler';
import { InvoiceCancelledHandler } from './events/handlers/invoice-cancelled.handler';
import { InvoiceRefundedHandler } from './events/handlers/invoice-refunded.handler';
const CommandHandlers = [
  ProcessPaymentHandler,
  ProcessBulkPaymentHandler,
  ApprovePaymentHandler,
  RejectPaymentHandler,
  CompletePaymentHandler,
  FailPaymentHandler,
  CancelPaymentHandler,
  RefundPaymentHandler,
  PayInvoiceHandler,
  CancelInvoiceHandler,
];

const QueryHandlers = [
  GetPaymentByIdHandler,
  GetPaymentsHandler,
  GetPaymentSummaryHandler,
  GetInvoiceByIdHandler,
  GetInvoicesHandler,
];

const EventHandlers = [
  PaymentCreatedHandler,
  PaymentStatusChangedHandler,
  PaymentApprovedHandler,
  PaymentCompletedHandler,
  PaymentFailedHandler,
  PaymentCancelledHandler,
  PaymentRefundedHandler,
  InvoiceCreatedHandler,
  InvoiceStatusChangedHandler,
  InvoicePaidHandler,
  InvoiceCancelledHandler,
  InvoiceRefundedHandler,
];
@Module({
  imports: [CqrsModule, DatabaseModule, AuditLogCqrsModule, PricingModule, NotificationModule],
  controllers: [
    PaymentController,
    InvoiceController,
  ],
  providers: [
    PaymentService,
    InvoiceService,
    AuditLogService,
    PrismaPaymentRepository,
    PrismaInvoiceRepository,
    PrismaCommissionStrategyRepository,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    {
      provide: 'PaymentRepositoryInterface',
      useClass: PrismaPaymentRepository,
    },
    {
      provide: 'InvoiceRepositoryInterface',
      useClass: PrismaInvoiceRepository,
    },
    {
      provide: 'CommissionStrategyRepositoryInterface',
      useClass: PrismaCommissionStrategyRepository,
    },
  ],
  exports: [
    CqrsModule,
    PaymentService,
    InvoiceService,
    'PaymentRepositoryInterface',
    'InvoiceRepositoryInterface',
  ],
})
export class PaymentModule {}
