import { Controller, Post, Get, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBookingCommand } from '../commands/create-booking.command';
import { ConfirmBookingCommand } from '../commands/confirm-booking.command';
import { CancelBookingCommand } from '../commands/cancel-booking.command';
import { CompleteBookingCommand } from '../commands/complete-booking.command';
import { ExpireBookingCommand } from '../commands/expire-booking.command';
import { ProcessBookingPaymentCommand } from '../commands/process-booking-payment.command';
import { GetBookingByIdQuery } from '../queries/get-booking-by-id.query';
import { GetBookingsQuery } from '../queries/get-bookings.query';
import { CheckBookingAvailabilityQuery } from '../queries/check-booking-availability.query';
import { GetBookingStatisticsQuery } from '../queries/get-booking-statistics.query';
import { 
  CreateBookingDto, 
  ConfirmBookingDto, 
  CancelBookingDto, 
  CompleteBookingDto, 
  ExpireBookingDto, 
  ProcessBookingPaymentDto,
  GetBookingsDto,
  CheckBookingAvailabilityDto,
  GetBookingStatisticsDto,
  BookingResponseDto,
  BookingAvailabilityResponseDto,
  BookingStatisticsResponseDto
} from '../dtos/booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() dto: CreateBookingDto): Promise<BookingResponseDto> {
    const command = new CreateBookingCommand(
      dto.userId,
      dto.resourceId,
      dto.resourceItemId,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.notes,
      dto.metadata
    );

    return await this.commandBus.execute(command);
  }

  @Put(':id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmBooking(
    @Param('id') id: string,
    @Body() dto: ConfirmBookingDto
  ): Promise<BookingResponseDto> {
    const command = new ConfirmBookingCommand(
      id,
      dto.notes,
      dto.metadata
    );

    return await this.commandBus.execute(command);
  }

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto
  ): Promise<BookingResponseDto> {
    const command = new CancelBookingCommand(
      id,
      dto.reason,
      dto.metadata
    );

    return await this.commandBus.execute(command);
  }

  @Put(':id/complete')
  @HttpCode(HttpStatus.OK)
  async completeBooking(
    @Param('id') id: string,
    @Body() dto: CompleteBookingDto
  ): Promise<BookingResponseDto> {
    const command = new CompleteBookingCommand(
      id,
      dto.notes,
      dto.metadata
    );

    return await this.commandBus.execute(command);
  }

  @Put(':id/expire')
  @HttpCode(HttpStatus.OK)
  async expireBooking(
    @Param('id') id: string,
    @Body() dto: ExpireBookingDto
  ): Promise<BookingResponseDto> {
    const command = new ExpireBookingCommand(
      id,
      dto.reason,
      dto.metadata
    );

    return await this.commandBus.execute(command);
  }

  @Post(':id/payment')
  @HttpCode(HttpStatus.OK)
  async processBookingPayment(
    @Param('id') id: string,
    @Body() dto: ProcessBookingPaymentDto
  ): Promise<any> {
    const command = new ProcessBookingPaymentCommand(
      id,
      dto.paymentMethod,
      dto.metadata
    );

    return await this.commandBus.execute(command);
  }

  @Get(':id')
  async getBookingById(@Param('id') id: string): Promise<BookingResponseDto> {
    const query = new GetBookingByIdQuery(id);
    return await this.queryBus.execute(query);
  }

  @Get()
  async getBookings(@Query() dto: GetBookingsDto): Promise<BookingResponseDto[]> {
    const query = new GetBookingsQuery(
      dto.userId,
      dto.resourceId,
      dto.resourceItemId,
      dto.status,
      dto.startDate ? new Date(dto.startDate) : undefined,
      dto.endDate ? new Date(dto.endDate) : undefined,
      dto.page,
      dto.limit
    );

    return await this.queryBus.execute(query);
  }

  @Get('availability/check')
  async checkBookingAvailability(@Query() dto: CheckBookingAvailabilityDto): Promise<BookingAvailabilityResponseDto> {
    const query = new CheckBookingAvailabilityQuery(
      dto.resourceItemId,
      new Date(dto.startDate),
      new Date(dto.endDate)
    );

    return await this.queryBus.execute(query);
  }

  @Get('statistics')
  async getBookingStatistics(@Query() dto: GetBookingStatisticsDto): Promise<BookingStatisticsResponseDto> {
    const query = new GetBookingStatisticsQuery(
      dto.userId,
      dto.resourceId,
      dto.startDate ? new Date(dto.startDate) : undefined,
      dto.endDate ? new Date(dto.endDate) : undefined
    );

    return await this.queryBus.execute(query);
  }
}
