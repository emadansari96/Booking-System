import { Module } from '@nestjs/common';
import { BookingController } from './controllers/booking.controller';
import { BookingCqrsModule } from './cqrs/booking-cqrs.module';
@Module({
  imports: [BookingCqrsModule],
  controllers: [BookingController],
  exports: [BookingCqrsModule],
})
export class BookingModule {}