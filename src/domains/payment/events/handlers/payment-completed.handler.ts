import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentCompletedEvent } from '../payment-completed.event';

@EventsHandler(PaymentCompletedEvent)
export class PaymentCompletedHandler implements IEventHandler<PaymentCompletedEvent> {
  async handle(event: PaymentCompletedEvent): Promise<void> {
    console.log(`Payment completed: ${event.paymentId} for user ${event.userId} - ${event.amount} ${event.currency}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Send completion confirmation
    // - Trigger booking confirmation
  }
}
