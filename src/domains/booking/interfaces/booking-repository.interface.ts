import { RepositoryInterface } from '../../../shared/domain/interfaces/repository.interface';
import { BookingEntity } from '../entities/booking.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';

export interface BookingSearchCriteria {
  userId?: UuidValueObject;
  resourceId?: UuidValueObject;
  resourceItemId?: UuidValueObject;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  paymentDeadlineBefore?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface BookingSearchResult {
  bookings: BookingEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface BookingAvailabilityResult {
  isAvailable: boolean;
  conflictingBookings: BookingEntity[];
  availableSlots: Array<{
    startDate: Date;
    endDate: Date;
  }>;
}

export interface BookingRepositoryInterface extends RepositoryInterface<BookingEntity> {
  findById(id: UuidValueObject): Promise<BookingEntity | null>;
  findByUserId(userId: UuidValueObject): Promise<BookingEntity[]>;
  findByResourceId(resourceId: UuidValueObject): Promise<BookingEntity[]>;
  findByResourceItemId(resourceItemId: UuidValueObject): Promise<BookingEntity[]>;
  findByStatus(status: string): Promise<BookingEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<BookingEntity[]>;
  findByPaymentDeadlineBefore(deadline: Date): Promise<BookingEntity[]>;
  findOverlappingBookings(
    resourceItemId: UuidValueObject,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: UuidValueObject
  ): Promise<BookingEntity[]>;
  checkAvailability(
    resourceItemId: UuidValueObject,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: UuidValueObject
  ): Promise<BookingAvailabilityResult>;
  findActiveBookings(): Promise<BookingEntity[]>;
  findPendingBookings(): Promise<BookingEntity[]>;
  findConfirmedBookings(): Promise<BookingEntity[]>;
  findCancelledBookings(): Promise<BookingEntity[]>;
  findCompletedBookings(): Promise<BookingEntity[]>;
  findExpiredBookings(): Promise<BookingEntity[]>;
  findPaymentPendingBookings(): Promise<BookingEntity[]>;
  findPaymentFailedBookings(): Promise<BookingEntity[]>;
  search(criteria: BookingSearchCriteria): Promise<BookingSearchResult>;
  findByUserAndResource(userId: UuidValueObject, resourceId: UuidValueObject): Promise<BookingEntity[]>;
  findByUserAndResourceItem(userId: UuidValueObject, resourceItemId: UuidValueObject): Promise<BookingEntity[]>;
  findRecentBookingsByUser(userId: UuidValueObject, limit: number): Promise<BookingEntity[]>;
  findBookingsByDateRangeAndResource(
    resourceId: UuidValueObject,
    startDate: Date,
    endDate: Date
  ): Promise<BookingEntity[]>;
  findBookingsByDateRangeAndResourceItem(
    resourceItemId: UuidValueObject,
    startDate: Date,
    endDate: Date
  ): Promise<BookingEntity[]>;
}
