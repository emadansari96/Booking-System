import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentCreatedEvent } from '../payment-created.event';

@EventsHandler(PaymentCreatedEvent)
export class PaymentCreatedHandler implements IEventHandler<PaymentCreatedEvent> {
  async handle(event: PaymentCreatedEvent): Promise<void> {
    console.log(`Payment created: ${event.paymentId} for user ${event.userId} - ${event.amount} ${event.currency}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Send email confirmation
  }
}
