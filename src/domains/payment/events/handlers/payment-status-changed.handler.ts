import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentStatusChangedEvent } from '../payment-status-changed.event';

@EventsHandler(PaymentStatusChangedEvent)
export class PaymentStatusChangedHandler implements IEventHandler<PaymentStatusChangedEvent> {
  async handle(event: PaymentStatusChangedEvent): Promise<void> {
    console.log(`Payment status changed: ${event.paymentId} from ${event.previousStatus} to ${event.newStatus}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Trigger workflow actions
  }
}
