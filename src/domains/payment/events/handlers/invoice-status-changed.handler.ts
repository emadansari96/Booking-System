import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvoiceStatusChangedEvent } from '../invoice-status-changed.event';
@EventsHandler(InvoiceStatusChangedEvent)
export class InvoiceStatusChangedHandler implements IEventHandler<InvoiceStatusChangedEvent> {
  async handle(event: InvoiceStatusChangedEvent): Promise<void> {
    console.log(`Invoice status changed: ${event.invoiceId} from ${event.previousStatus} to ${event.newStatus}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
    // - Trigger workflow actions
  }
}
