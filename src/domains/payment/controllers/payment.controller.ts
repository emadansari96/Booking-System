import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, ParseUUIDPipe, UsePipes, ValidationPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
// Commands
import { ProcessPaymentCommand } from '../commands/process-payment.command';
import { CompletePaymentCommand } from '../commands/complete-payment.command';
import { ApprovePaymentCommand } from '../commands/approve-payment.command';
import { RefundPaymentCommand } from '../commands/refund-payment.command';
import { CancelPaymentCommand } from '../commands/cancel-payment.command';
// Queries
import { GetPaymentByIdQuery } from '../queries/get-payment-by-id.query';
import { GetPaymentsQuery } from '../queries/get-payments.query';
import { GetPaymentSummaryQuery } from '../queries/get-payment-summary.query';
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
@Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
      async processPayment(@Request() req: any, @Body() processPaymentDto: any): Promise<any> {
    const command = new ProcessPaymentCommand(
      req.user.id,
      processPaymentDto.resourceId,
      processPaymentDto.resourceType,
      processPaymentDto.basePrice,
      processPaymentDto.currency,
      processPaymentDto.bookingDurationHours,
      new Date(processPaymentDto.startDate),
      new Date(processPaymentDto.endDate),
      processPaymentDto.paymentMethod,
      processPaymentDto.resourceItemId,
      processPaymentDto.description,
      processPaymentDto.metadata
    );
    return await this.commandBus.execute(command);
  }
@Get()
  async getPayments(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    // If no userId provided, use current user's ID (for customers)
    const queryUserId = userId || req.user.id;
    const query = new GetPaymentsQuery(
      queryUserId,
      status,
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    return {
      payments: (result?.payments || []).map(payment => this.mapToResponseDto(payment)),
      pagination: result?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  }
@Get('history')
  async getUserPaymentHistory(@Request() req: any): Promise<any> {
    const query = new GetPaymentsQuery(
      req.user.id,
      undefined, // status
      1, // page
      100 // limit
    );
    const result = await this.queryBus.execute(query);
    return {
      payments: (result?.payments || []).map(payment => this.mapToResponseDto(payment)),
      pagination: result?.pagination || { page: 1, limit: 100, total: 0, totalPages: 0 }
    };
  }
@Get(':id')
        async getPaymentById(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const query = new GetPaymentByIdQuery(id);
    const payment = await this.queryBus.execute(query);
    if (!payment) {
      return null;
    }
    return this.mapToResponseDto(payment);
  }
@Put(':id/pay')
        async customerPayment(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() paymentDto: { paymentMethod: string; cardNumber?: string; cvv?: string; expiryDate?: string }
  ): Promise<any> {
    // First approve the payment, then complete it
    const approveCommand = new ApprovePaymentCommand(id, req.user.id);
    await this.commandBus.execute(approveCommand);
    
    // Then complete the payment
    const completeCommand = new CompletePaymentCommand(id);
    return await this.commandBus.execute(completeCommand);
  }
@Put(':id/complete')
        async completePayment(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const command = new CompletePaymentCommand(id);
    return await this.commandBus.execute(command);
  }
@Put(':id/refund')
        async refundPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() refundDto: { reason?: string; amount?: number } = {}
  ): Promise<any> {
    const command = new RefundPaymentCommand(id);
    return await this.commandBus.execute(command);
  }
@Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
        async cancelPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelDto: { reason?: string } = {}
  ): Promise<void> {
    const command = new CancelPaymentCommand(id);
    await this.commandBus.execute(command);
  }
@Get('summary')
            async getPaymentSummary(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<any> {
    const query = new GetPaymentSummaryQuery(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    return await this.queryBus.execute(query);
  }

  // Helper method to map domain entity to response DTO
  private mapToResponseDto(payment: any): any {
    if (!payment) {
      return null;
    }
    
    return {
      id: payment.id?.value || payment.id,
      userId: payment.userId?.value || payment.userId,
      resourceId: payment.resourceId?.value || payment.resourceId,
      resourceItemId: payment.resourceItemId?.value || payment.resourceItemId,
      amount: payment.amount?.value || payment.amount,
      currency: payment.currency?.value || payment.currency,
      status: payment.status?.value || payment.status,
      paymentMethod: payment.paymentMethod?.value || payment.paymentMethod,
      description: payment.description,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      completedAt: payment.completedAt
    };
  }
}
