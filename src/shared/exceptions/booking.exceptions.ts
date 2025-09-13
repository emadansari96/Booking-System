import { HttpException, HttpStatus } from '@nestjs/common';
export class BookingNotFoundException extends HttpException {
  constructor(bookingId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Booking not found',
        error: 'BOOKING_NOT_FOUND',
        details: { bookingId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class BookingPeriodOverlapException extends HttpException {
  constructor(startDate: Date, endDate: Date) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: 'Booking period overlaps with existing reservation',
        error: 'PERIOD_OVERLAP',
        details: { startDate, endDate }
      },
      HttpStatus.CONFLICT
    );
  }
}

export class BookingExpiredException extends HttpException {
  constructor(bookingId: string) {
    super(
      {
        statusCode: HttpStatus.GONE,
        message: 'Booking has expired',
        error: 'BOOKING_EXPIRED',
        details: { bookingId }
      },
      HttpStatus.GONE
    );
  }
}

export class BookingCancelledException extends HttpException {
  constructor(bookingId: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Booking has been cancelled',
        error: 'BOOKING_CANCELLED',
        details: { bookingId }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class BookingAlreadyConfirmedException extends HttpException {
  constructor(bookingId: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Booking is already confirmed',
        error: 'BOOKING_ALREADY_CONFIRMED',
        details: { bookingId }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class ResourceItemNotAvailableException extends HttpException {
  constructor(resourceItemId: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Resource item is not available for booking',
        error: 'RESOURCE_ITEM_NOT_AVAILABLE',
        details: { resourceItemId }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidBookingPeriodException extends HttpException {
  constructor(startDate: Date, endDate: Date) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid booking period',
        error: 'INVALID_BOOKING_PERIOD',
        details: { 
          startDate, 
          endDate,
          reason: 'End date must be after start date'
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

