import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingPaymentPendingEvent } from '../booking-payment-pending.event';
@EventsHandler(BookingPaymentPendingEvent)
export class BookingPaymentPendingHandler implements IEventHandler<BookingPaymentPendingEvent> {
  constructor() {}

  async handle(event: BookingPaymentPendingEvent): Promise<void> {
    console.log(`Booking payment pending: ${event.bookingId} for user ${event.userId}`);
    // Here you can add additional logic like:
    // - Send payment reminder notification to user
    // - Set up payment deadline timer
    // - Log the event
  }
}
