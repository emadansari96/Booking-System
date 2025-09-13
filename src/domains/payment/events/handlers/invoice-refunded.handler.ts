import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvoiceRefundedEvent } from '../invoice-refunded.event';

@EventsHandler(InvoiceRefundedEvent)
export class InvoiceRefundedHandler implements IEventHandler<InvoiceRefundedEvent> {
  async handle(event: InvoiceRefundedEvent): Promise<void> {
    console.log(`Invoice refunded: ${event.invoiceNumber} for user ${event.userId} - ${event.totalAmount} ${event.currency}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Send refund confirmation
    // - Process refund in external system
  }
}
