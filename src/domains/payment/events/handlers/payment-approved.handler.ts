import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentApprovedEvent } from '../payment-approved.event';

@EventsHandler(PaymentApprovedEvent)
export class PaymentApprovedHandler implements IEventHandler<PaymentApprovedEvent> {
  async handle(event: PaymentApprovedEvent): Promise<void> {
    console.log(`Payment approved: ${event.paymentId} by ${event.approvedBy} - ${event.amount} ${event.currency}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Send approval confirmation
  }
}
