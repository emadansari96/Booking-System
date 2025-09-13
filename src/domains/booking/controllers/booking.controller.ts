import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, ParseUUIDPipe, UsePipes, ValidationPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
// Commands
import { CreateBookingCommand } from '../commands/create-booking.command';
import { ConfirmBookingCommand } from '../commands/confirm-booking.command';
import { CancelBookingCommand } from '../commands/cancel-booking.command';
import { CompleteBookingCommand } from '../commands/complete-booking.command';
// Queries
import { GetBookingByIdQuery } from '../queries/get-booking-by-id.query';
import { GetBookingsQuery } from '../queries/get-bookings.query';
import { CheckBookingAvailabilityQuery } from '../queries/check-booking-availability.query';
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
@Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createBooking(@Request() req: any, @Body() createBookingDto: any): Promise<any> {
    try {
      const command = new CreateBookingCommand(
        req.user.id,
        createBookingDto.resourceItemId,
        new Date(createBookingDto.startDate),
        new Date(createBookingDto.endDate),
        createBookingDto.notes,
        createBookingDto.metadata
      );
      const result = await this.commandBus.execute(command);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return {
        booking: this.mapToResponseDto(result.booking),
        invoice: result.invoice ? this.mapInvoiceToResponseDto(result.invoice) : null,
        invoiceStatus: result.invoiceStatus,
        invoiceError: result.invoiceError,
      };
    } catch (error) {
      throw error; // Let the global exception filter handle it
    }
  }
@Get()
  async getBookings(
    @Query('userId') userId?: string,
    @Query('resourceItemId') resourceItemId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    const query = new GetBookingsQuery(
      userId,
      resourceItemId,
      status as any,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    return {
      bookings: (result.bookings || []).map(booking => this.mapToResponseDto(booking)),
      pagination: result.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  }
@Get('history')
  async getUserBookingHistory(@Request() req: any): Promise<any> {
    const query = new GetBookingsQuery(
      req.user.id,
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      100
    );
    const result = await this.queryBus.execute(query);
    return {
      bookings: (result.bookings || []).map(booking => this.mapToResponseDto(booking)),
      pagination: result.pagination || { page: 1, limit: 100, total: 0, totalPages: 0 }
    };
  }
@Get(':id')
  async getBookingById(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const query = new GetBookingByIdQuery(id);
    const booking = await this.queryBus.execute(query);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return this.mapToResponseDto(booking);
  }
@Put(':id/confirm')
  async confirmBooking(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const command = new ConfirmBookingCommand(id);
    const result = await this.commandBus.execute(command);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return this.mapToResponseDto(result.booking);
  }
@Put(':id/complete')
  async completeBooking(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const command = new CompleteBookingCommand(id);
    const booking = await this.commandBus.execute(command);
    return this.mapToResponseDto(booking);
  }
@Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelDto: { reason?: string } = {}
  ): Promise<void> {
    const command = new CancelBookingCommand(
      id, 
      cancelDto.reason
    );
    await this.commandBus.execute(command);
  }
@Get('availability/check')
  async checkAvailability(
    @Query('resourceItemId') resourceItemId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<any> {
    const query = new CheckBookingAvailabilityQuery(
      resourceItemId,
      new Date(startDate),
      new Date(endDate)
    );
    return await this.queryBus.execute(query);
  }

  // Helper method to map domain entity to response DTO
  private mapToResponseDto(booking: any): any {
    if (!booking) {
      return null;
    }

    return {
      id: booking.id?.value || booking.id,
      userId: booking.userId?.value || booking.userId,
      resourceItemId: booking.resourceItemId?.value || booking.resourceItemId,
      startDate: booking.startDate || booking.period?.startDate,
      endDate: booking.endDate || booking.period?.endDate,
      status: booking.status?.value || booking.status,
      totalPrice: booking.totalPrice?.value || booking.price?.totalPrice,
      currency: booking.totalPrice?.currency || booking.price?.currency,
      notes: booking.notes,
      metadata: booking.metadata,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
  }

  private mapPaymentToResponseDto(payment: any): any {
    if (!payment) return null;

    return {
      id: payment.id?.value || payment.id,
      userId: payment.userId?.value || payment.userId,
      invoiceId: payment.invoiceId?.value || payment.invoiceId,
      method: payment.method?.value || payment.method,
      status: payment.status?.value || payment.status,
      amount: payment.amount?.value || payment.amount,
      currency: payment.currency?.value || payment.currency,
      description: payment.description,
      reference: payment.reference,
      approvedBy: payment.approvedBy?.value || payment.approvedBy,
      approvedAt: payment.approvedAt,
      completedAt: payment.completedAt,
      failedAt: payment.failedAt,
      cancelledAt: payment.cancelledAt,
      refundedAt: payment.refundedAt,
      failureReason: payment.failureReason,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    };
  }

  private mapInvoiceToResponseDto(invoice: any): any {
    if (!invoice) return null;

    return {
      id: invoice.id?.value || invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      userId: invoice.userId?.value || invoice.userId,
      status: invoice.status?.value || invoice.status,
      subtotal: invoice.subtotal?.value || invoice.subtotal,
      taxAmount: invoice.taxAmount?.value || invoice.taxAmount,
      discountAmount: invoice.discountAmount?.value || invoice.discountAmount,
      totalAmount: invoice.totalAmount?.value || invoice.totalAmount,
      currency: invoice.currency?.value || invoice.currency,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      cancelledAt: invoice.cancelledAt,
      refundedAt: invoice.refundedAt,
      notes: invoice.notes,
      metadata: invoice.metadata,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt
    };
  }
}
