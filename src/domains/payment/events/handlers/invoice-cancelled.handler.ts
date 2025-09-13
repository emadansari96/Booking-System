import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvoiceCancelledEvent } from '../invoice-cancelled.event';

@EventsHandler(InvoiceCancelledEvent)
export class InvoiceCancelledHandler implements IEventHandler<InvoiceCancelledEvent> {
  async handle(event: InvoiceCancelledEvent): Promise<void> {
    console.log(`Invoice cancelled: ${event.invoiceNumber} for user ${event.userId} - ${event.totalAmount} ${event.currency}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Send cancellation confirmation
    // - Release resources
  }
}
