import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentRefundedEvent } from '../payment-refunded.event';
@EventsHandler(PaymentRefundedEvent)
export class PaymentRefundedHandler implements IEventHandler<PaymentRefundedEvent> {
  async handle(event: PaymentRefundedEvent): Promise<void> {
    console.log(`Payment refunded: ${event.paymentId} for user ${event.userId} - ${event.amount} ${event.currency}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Send refund confirmation
    // - Process refund in external system
  }
}
