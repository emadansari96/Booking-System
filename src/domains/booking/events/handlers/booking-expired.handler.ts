import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingExpiredEvent } from '../booking-expired.event';
@EventsHandler(BookingExpiredEvent)
export class BookingExpiredHandler implements IEventHandler<BookingExpiredEvent> {
  constructor() {}

  async handle(event: BookingExpiredEvent): Promise<void> {
    console.log(`Booking expired: ${event.bookingId} for user ${event.userId}`);
    // Here you can add additional logic like:
    // - Send expiration notification to user
    // - Update resource availability
    // - Log the event
  }
}
