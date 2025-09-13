import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export interface BookingPeriodProps {
  startDate: Date;
  endDate: Date;
}

export class BookingPeriod extends ValueObjectBase<BookingPeriodProps> {
  constructor(startDate: Date, endDate: Date) {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    super({ startDate, endDate });
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  public static create(startDate: Date, endDate: Date): BookingPeriod {
    return new BookingPeriod(startDate, endDate);
  }

  public static fromPersistence(startDate: Date, endDate: Date): BookingPeriod {
    return new BookingPeriod(startDate, endDate);
  }

  public getDurationInHours(): number {
    const diffInMs = this.props.endDate.getTime() - this.props.startDate.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60));
  }

  public getDurationInDays(): number {
    const diffInMs = this.props.endDate.getTime() - this.props.startDate.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  }

  public overlaps(other: BookingPeriod): boolean {
    // Check if periods overlap (exclusive end date)
    return this.props.startDate < other.props.endDate && this.props.endDate > other.props.startDate;
  }

  public contains(date: Date): boolean {
    // Start date is inclusive, end date is exclusive
    return date >= this.props.startDate && date < this.props.endDate;
  }

  public isAdjacent(other: BookingPeriod): boolean {
    // Check if periods are adjacent (one ends when the other starts)
    return this.props.endDate.getTime() === other.props.startDate.getTime() ||
           other.props.endDate.getTime() === this.props.startDate.getTime();
  }

  public equals(other: BookingPeriod): boolean {
    return this.props.startDate.getTime() === other.props.startDate.getTime() &&
           this.props.endDate.getTime() === other.props.endDate.getTime();
  }

  public toRangeString(): string {
    return `[${this.props.startDate.toISOString()}, ${this.props.endDate.toISOString()})`;
  }

  public isInFuture(): boolean {
    return this.props.startDate > new Date();
  }

  public isInPast(): boolean {
    return this.props.endDate <= new Date();
  }

  public isCurrentlyActive(): boolean {
    const now = new Date();
    return now >= this.props.startDate && now < this.props.endDate;
  }
}
