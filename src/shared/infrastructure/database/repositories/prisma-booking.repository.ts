import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookingRepositoryInterface } from '../../../../domains/booking/interfaces/booking-repository.interface';
import { BookingEntity } from '../../../../domains/booking/entities/booking.entity';
import { UuidValueObject } from '../../../domain/base/value-objects/uuid.value-object';
import { BookingStatus } from '../../../../domains/booking/value-objects/booking-status.value-object';
import { BookingPeriod } from '../../../../domains/booking/value-objects/booking-period.value-object';
import { BookingPrice } from '../../../../domains/booking/value-objects/booking-price.value-object';
import { BookingStatus as PrismaBookingStatus } from '@prisma/client';
@Injectable()
export class PrismaBookingRepository implements BookingRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: BookingEntity): Promise<BookingEntity> {
    const data = {
      id: entity.id.value,
      userId: entity.userId.value,
      resourceItemId: entity.resourceItemId.value,
      status: entity.status.value as any,
      startDate: entity.period.startDate,
      endDate: entity.period.endDate,
      basePrice: entity.price.basePrice,
      commissionAmount: entity.price.commissionAmount,
      totalPrice: entity.price.totalPrice,
      currency: entity.price.currency,
      notes: entity.notes,
      paymentDeadline: entity.paymentDeadline,
      confirmedAt: entity.confirmedAt,
      cancelledAt: entity.cancelledAt,
      completedAt: entity.completedAt,
      expiredAt: entity.expiredAt,
      paymentFailedAt: entity.paymentFailedAt,
      metadata: entity.metadata,
    };

    try {
      const saved = await this.prisma.booking.upsert({
        where: { id: entity.id.value },
        create: data,
        update: data,
      });

      return this.toDomainEntity(saved);
    } catch (error) {
      // Check if it's an EXCLUDE constraint violation (overlap)
      if (error.code === '23P01' || error.message?.includes('exclusion') || error.message?.includes('overlaps')) {
        const overlapError = new Error('Booking period overlaps with existing reservation');
        (overlapError as any).code = 'OVERLAP_CONSTRAINT';
        throw overlapError;
      }
      // Re-throw other errors
      throw error;
    }
  }

  async findById(id: UuidValueObject): Promise<BookingEntity | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: id.value },
    });

    return booking ? this.toDomainEntity(booking) : null;
  }

  async findByUserId(userId: UuidValueObject): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { userId: userId.value },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findByResourceItemId(resourceItemId: UuidValueObject): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { resourceItemId: resourceItemId.value },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findByStatus(status: string): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { status: status as any },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          {
            startDate: { gte: startDate, lte: endDate },
          },
          {
            endDate: { gte: startDate, lte: endDate },
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findOverlappingBookings(
    resourceItemId: UuidValueObject,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: UuidValueObject
  ): Promise<BookingEntity[]> {
    // Use raw SQL to leverage GIST index for efficient range queries
    const query = `
      SELECT b.* FROM bookings b
      WHERE b.resource_item_id = $1
        AND b.status IN ('PENDING', 'CONFIRMED', 'PAYMENT_PENDING')
        AND b.period && tstzrange($2, $3, '[)')
        ${excludeBookingId ? 'AND b.id != $4' : ''}
      ORDER BY b.created_at DESC
    `;
    
    const params = excludeBookingId 
      ? [resourceItemId.value, startDate, endDate, excludeBookingId.value]
      : [resourceItemId.value, startDate, endDate];

    const bookings = await this.prisma.$queryRawUnsafe(query, ...params) as any[];

    return bookings.map((booking: any) => this.toDomainEntity(booking));
  }

  async findExpiredBookings(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { status: PrismaBookingStatus.EXPIRED },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findPaymentPendingBookings(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { status: PrismaBookingStatus.PAYMENT_PENDING },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findPaymentFailedBookings(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { status: PrismaBookingStatus.PAYMENT_FAILED },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async checkAvailability(
    resourceItemId: UuidValueObject,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: UuidValueObject
  ): Promise<{ isAvailable: boolean; conflictingBookings: BookingEntity[]; availableSlots: Array<{ startDate: Date; endDate: Date; }> }> {
    // Use Prisma ORM for availability check
    const whereClause: any = {
      resourceItemId: resourceItemId.value,
      status: {
        in: ['PENDING', 'CONFIRMED', 'PAYMENT_PENDING']
      },
      OR: [
        // New booking starts during existing booking
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gt: startDate } }
          ]
        },
        // New booking ends during existing booking
        {
          AND: [
            { startDate: { lt: endDate } },
            { endDate: { gte: endDate } }
          ]
        },
        // New booking completely contains existing booking
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } }
          ]
        },
        // Existing booking completely contains new booking
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: endDate } }
          ]
        }
      ]
    };

    if (excludeBookingId) {
      whereClause.id = { not: excludeBookingId.value };
    }

    const conflictingBookings = await this.prisma.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return {
      isAvailable: conflictingBookings.length === 0,
      conflictingBookings: conflictingBookings.map((booking: any) => this.toDomainEntity(booking)),
      availableSlots: conflictingBookings.length === 0 ? [{ startDate, endDate }] : [],
    };
  }

  async findAll(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async delete(id: UuidValueObject): Promise<void> {
    await this.prisma.booking.delete({
      where: { id: id.value },
    });
  }

  // Additional methods required by interface
  async findByPaymentDeadlineBefore(deadline: Date): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        paymentDeadline: { lte: deadline },
        status: { in: [PrismaBookingStatus.PENDING, PrismaBookingStatus.PAYMENT_PENDING] },
      },
      orderBy: { paymentDeadline: 'asc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findActiveBookings(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: { in: [PrismaBookingStatus.PENDING, PrismaBookingStatus.CONFIRMED, PrismaBookingStatus.PAYMENT_PENDING] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findPendingBookings(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { status: PrismaBookingStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findConfirmedBookings(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { status: PrismaBookingStatus.CONFIRMED },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findCancelledBookings(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { status: PrismaBookingStatus.CANCELLED },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findCompletedBookings(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { status: PrismaBookingStatus.COMPLETED },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findByResourceItemAndDateRange(resourceItemId: UuidValueObject, startDate: Date, endDate: Date): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        resourceItemId: resourceItemId.value,
        OR: [
          {
            startDate: { gte: startDate, lte: endDate },
          },
          {
            endDate: { gte: startDate, lte: endDate },
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findByUserAndDateRange(userId: UuidValueObject, startDate: Date, endDate: Date): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId: userId.value,
        OR: [
          {
            startDate: { gte: startDate, lte: endDate },
          },
          {
            endDate: { gte: startDate, lte: endDate },
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findByUserAndStatus(userId: UuidValueObject, status: string): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId: userId.value,
        status: status as any,
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async search(criteria: any): Promise<{ bookings: BookingEntity[]; total: number; page: number; limit: number }> {
    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    
    if (criteria.userId) whereClause.userId = criteria.userId.value;
    if (criteria.resourceItemId) whereClause.resourceItemId = criteria.resourceItemId.value;
    if (criteria.status) whereClause.status = criteria.status;
    if (criteria.startDate || criteria.endDate) {
      whereClause.OR = [];
      if (criteria.startDate) whereClause.OR.push({ startDate: { gte: criteria.startDate } });
      if (criteria.endDate) whereClause.OR.push({ endDate: { lte: criteria.endDate } });
    }
    if (criteria.paymentDeadlineBefore) {
      whereClause.paymentDeadline = { lte: criteria.paymentDeadlineBefore };
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where: whereClause }),
    ]);

    return {
      bookings: bookings.map(booking => this.toDomainEntity(booking)),
      total,
      page,
      limit,
    };
  }

  async findByUserAndResourceItem(userId: UuidValueObject, resourceItemId: UuidValueObject): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId: userId.value,
        resourceItemId: resourceItemId.value,
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findRecentBookingsByUser(userId: UuidValueObject, limit: number = 10): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { userId: userId.value },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  async findBookingsByDateRangeAndResourceItem(resourceItemId: UuidValueObject, startDate: Date, endDate: Date): Promise<BookingEntity[]> {
    return await this.findByResourceItemAndDateRange(resourceItemId, startDate, endDate);
  }

  async findOverdueBookings(): Promise<BookingEntity[]> {
    // Find bookings that are PENDING and created more than 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: fiveMinutesAgo }
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => this.toDomainEntity(booking));
  }

  private toDomainEntity(prismaBooking: any): BookingEntity {
    return BookingEntity.fromPersistence({
      id: UuidValueObject.fromString(prismaBooking.id),
      userId: UuidValueObject.fromString(prismaBooking.userId),
      resourceItemId: UuidValueObject.fromString(prismaBooking.resourceItemId),
      status: BookingStatus.fromPersistence(prismaBooking.status),
      period: BookingPeriod.create(prismaBooking.startDate, prismaBooking.endDate),
      price: BookingPrice.fromPersistence(prismaBooking.basePrice, prismaBooking.commissionAmount, prismaBooking.totalPrice, prismaBooking.currency),
      notes: prismaBooking.notes,
      paymentDeadline: prismaBooking.paymentDeadline,
      confirmedAt: prismaBooking.confirmedAt,
      cancelledAt: prismaBooking.cancelledAt,
      completedAt: prismaBooking.completedAt,
      expiredAt: prismaBooking.expiredAt,
      paymentFailedAt: prismaBooking.paymentFailedAt,
      metadata: prismaBooking.metadata,
      createdAt: prismaBooking.createdAt,
      updatedAt: prismaBooking.updatedAt,
    });
  }
}