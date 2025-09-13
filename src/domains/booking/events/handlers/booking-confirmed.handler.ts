import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingConfirmedEvent } from '../booking-confirmed.event';
@EventsHandler(BookingConfirmedEvent)
export class BookingConfirmedHandler implements IEventHandler<BookingConfirmedEvent> {
  constructor() {}

  async handle(event: BookingConfirmedEvent): Promise<void> {
    console.log(`Booking confirmed: ${event.bookingId} for user ${event.userId}`);
    // Here you can add additional logic like:
    // - Send confirmation notification to user
    // - Update resource availability
    // - Log the event
  }
}
