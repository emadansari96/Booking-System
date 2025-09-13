import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingCompletedEvent } from '../booking-completed.event';
@EventsHandler(BookingCompletedEvent)
export class BookingCompletedHandler implements IEventHandler<BookingCompletedEvent> {
  constructor() {}

  async handle(event: BookingCompletedEvent): Promise<void> {
    console.log(`Booking completed: ${event.bookingId} for user ${event.userId}`);
    // Here you can add additional logic like:
    // - Send completion notification to user
    // - Update resource availability
    // - Generate invoice
    // - Log the event
  }
}
