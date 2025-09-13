import { BookingStatus } from '../value-objects/booking-status.value-object';
export class GetBookingsQuery {
  constructor(
    public readonly userId?: string,
    public readonly resourceItemId?: string,
    public readonly status?: BookingStatus,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'status',
    public readonly sortOrder?: 'ASC' | 'DESC'
  ) {}
}
