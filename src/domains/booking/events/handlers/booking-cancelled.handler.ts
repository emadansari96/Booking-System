import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingCancelledEvent } from '../booking-cancelled.event';
@EventsHandler(BookingCancelledEvent)
export class BookingCancelledHandler implements IEventHandler<BookingCancelledEvent> {
  constructor() {}

  async handle(event: BookingCancelledEvent): Promise<void> {
    console.log(`Booking cancelled: ${event.bookingId} for user ${event.userId}`);
    // Here you can add additional logic like:
    // - Send cancellation notification to user
    // - Update resource availability
    // - Process refund if needed
    // - Log the event
  }
}
