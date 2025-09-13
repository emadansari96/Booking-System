import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentFailedEvent } from '../payment-failed.event';
@EventsHandler(PaymentFailedEvent)
export class PaymentFailedHandler implements IEventHandler<PaymentFailedEvent> {
  async handle(event: PaymentFailedEvent): Promise<void> {
    console.log(`Payment failed: ${event.paymentId} for user ${event.userId} - ${event.amount} ${event.currency} - Reason: ${event.reason}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Send failure notification
    // - Trigger retry logic
  }
}
