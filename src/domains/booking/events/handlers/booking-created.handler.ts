import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingCreatedEvent } from '../booking-created.event';
@EventsHandler(BookingCreatedEvent)
export class BookingCreatedHandler implements IEventHandler<BookingCreatedEvent> {
  constructor() {}

  async handle(event: BookingCreatedEvent): Promise<void> {
    console.log(`Booking created: ${event.bookingId} for user ${event.userId}`);
    // Here you can add additional logic like:
    // - Send notification to user
    // - Update resource availability
    // - Log the event
  }
}
