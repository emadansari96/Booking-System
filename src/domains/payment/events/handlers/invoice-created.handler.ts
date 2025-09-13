import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvoiceCreatedEvent } from '../invoice-created.event';

@EventsHandler(InvoiceCreatedEvent)
export class InvoiceCreatedHandler implements IEventHandler<InvoiceCreatedEvent> {
  async handle(event: InvoiceCreatedEvent): Promise<void> {
    console.log(`Invoice created: ${event.invoiceNumber} for user ${event.userId} - ${event.totalAmount} ${event.currency}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Send invoice email
    // - Generate PDF invoice
  }
}
