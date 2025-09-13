import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingPaymentFailedEvent } from '../booking-payment-failed.event';

@EventsHandler(BookingPaymentFailedEvent)
export class BookingPaymentFailedHandler implements IEventHandler<BookingPaymentFailedEvent> {
  constructor() {}

  async handle(event: BookingPaymentFailedEvent): Promise<void> {
    console.log(`Booking payment failed: ${event.bookingId} for user ${event.userId}`);
    // Here you can add additional logic like:
    // - Send payment failure notification to user
    // - Update resource availability
    // - Log the event
  }
}
