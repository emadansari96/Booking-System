import { Controller, Get, Post, Put, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ProcessPaymentCommand } from '../commands/process-payment.command';
import { ProcessBulkPaymentCommand } from '../commands/process-bulk-payment.command';
import { ApprovePaymentCommand } from '../commands/approve-payment.command';
import { CompletePaymentCommand } from '../commands/complete-payment.command';
import { FailPaymentCommand } from '../commands/fail-payment.command';
import { CancelPaymentCommand } from '../commands/cancel-payment.command';
import { RefundPaymentCommand } from '../commands/refund-payment.command';
import { GetPaymentByIdQuery } from '../queries/get-payment-by-id.query';
import { GetPaymentsQuery } from '../queries/get-payments.query';
import { GetPaymentSummaryQuery } from '../queries/get-payment-summary.query';
import {
  ProcessPaymentDto,
  ProcessBulkPaymentDto,
  ApprovePaymentDto,
  FailPaymentDto,
  PaymentResponseDto,
  PaymentListResponseDto,
  PaymentSummaryResponseDto,
} from '../dtos/payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async processPayment(@Body() dto: ProcessPaymentDto): Promise<PaymentResponseDto> {
    const command = new ProcessPaymentCommand(
      dto.userId,
      dto.resourceId,
      dto.resourceType,
      dto.basePrice,
      dto.currency,
      dto.bookingDurationHours,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.paymentMethod,
      dto.resourceItemId,
      dto.description,
      dto.metadata
    );

    return await this.commandBus.execute(command);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async processBulkPayment(@Body() dto: ProcessBulkPaymentDto): Promise<PaymentResponseDto> {
    const command = new ProcessBulkPaymentCommand(
      dto.userId,
      dto.items.map(item => ({
        resourceId: item.resourceId,
        resourceItemId: item.resourceItemId,
        resourceType: item.resourceType,
        basePrice: item.basePrice,
        bookingDurationHours: item.bookingDurationHours,
        startDate: new Date(item.startDate),
        endDate: new Date(item.endDate),
        description: item.description,
        metadata: item.metadata,
      })),
      dto.currency,
      dto.paymentMethod,
      new Date(dto.dueDate),
      dto.taxRate,
      dto.discountAmount,
      dto.notes,
      dto.metadata
    );

    return await this.commandBus.execute(command);
  }

  @Get(':id')
  async getPaymentById(@Param('id') id: string): Promise<PaymentResponseDto> {
    const query = new GetPaymentByIdQuery(id);
    return await this.queryBus.execute(query);
  }

  @Get()
  async getPayments(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('currency') currency?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaymentListResponseDto> {
    const query = new GetPaymentsQuery(
      userId,
      status,
      method,
      currency,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page,
      limit
    );
    return await this.queryBus.execute(query);
  }

  @Get('summary/overview')
  async getPaymentSummary(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ): Promise<PaymentSummaryResponseDto> {
    const query = new GetPaymentSummaryQuery(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      status
    );
    return await this.queryBus.execute(query);
  }

  @Put(':id/approve')
  async approvePayment(
    @Param('id') id: string,
    @Body() dto: ApprovePaymentDto
  ): Promise<PaymentResponseDto> {
    const command = new ApprovePaymentCommand(id, dto.approvedBy);
    return await this.commandBus.execute(command);
  }

  @Put(':id/complete')
  async completePayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    const command = new CompletePaymentCommand(id);
    return await this.commandBus.execute(command);
  }

  @Put(':id/fail')
  async failPayment(
    @Param('id') id: string,
    @Body() dto: FailPaymentDto
  ): Promise<PaymentResponseDto> {
    const command = new FailPaymentCommand(id, dto.reason);
    return await this.commandBus.execute(command);
  }

  @Put(':id/cancel')
  async cancelPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    const command = new CancelPaymentCommand(id);
    return await this.commandBus.execute(command);
  }

  @Put(':id/refund')
  async refundPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    const command = new RefundPaymentCommand(id);
    return await this.commandBus.execute(command);
  }
}
