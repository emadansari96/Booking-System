import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentCancelledEvent } from '../payment-cancelled.event';

@EventsHandler(PaymentCancelledEvent)
export class PaymentCancelledHandler implements IEventHandler<PaymentCancelledEvent> {
  async handle(event: PaymentCancelledEvent): Promise<void> {
    console.log(`Payment cancelled: ${event.paymentId} for user ${event.userId} - ${event.amount} ${event.currency}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Send cancellation confirmation
    // - Release resources
  }
}
