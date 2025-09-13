import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvoicePaidEvent } from '../invoice-paid.event';
@EventsHandler(InvoicePaidEvent)
export class InvoicePaidHandler implements IEventHandler<InvoicePaidEvent> {
  async handle(event: InvoicePaidEvent): Promise<void> {
    console.log(`Invoice paid: ${event.invoiceNumber} for user ${event.userId} - ${event.totalAmount} ${event.currency}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Send payment confirmation
    // - Trigger booking confirmation
  }
}
