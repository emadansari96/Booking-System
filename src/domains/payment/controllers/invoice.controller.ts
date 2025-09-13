import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards, ParseUUIDPipe, UsePipes, ValidationPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
// Commands
import { PayInvoiceCommand } from '../commands/pay-invoice.command';
import { CancelInvoiceCommand } from '../commands/cancel-invoice.command';
// Queries
import { GetInvoiceByIdQuery } from '../queries/get-invoice-by-id.query';
import { GetInvoicesQuery } from '../queries/get-invoices.query';
@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
@Get()
  async getInvoices(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    // If no userId provided, use current user's ID (for customers)
    const queryUserId = userId || req.user.id;
    const query = new GetInvoicesQuery(
      queryUserId,
      status,
      undefined, // currency
      undefined, // startDate
      undefined, // endDate
      undefined, // dueDateStart
      undefined, // dueDateEnd
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    return {
      invoices: result.invoices.map(invoice => this.mapToResponseDto(invoice)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
@Get('history')
  async getUserInvoiceHistory(@Request() req: any): Promise<any> {
    const query = new GetInvoicesQuery(
      req.user.id,
      undefined, // status
      undefined, // currency
      undefined, // startDate
      undefined, // endDate
      undefined, // dueDateStart
      undefined, // dueDateEnd
      1, // page
      100 // limit
    );
    const result = await this.queryBus.execute(query);
    return {
      invoices: result.invoices.map(invoice => this.mapToResponseDto(invoice)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
@Get(':id')
        async getInvoiceById(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const query = new GetInvoiceByIdQuery(id);
    const invoice = await this.queryBus.execute(query);
    if (!invoice) {
      return null;
    }
    return this.mapToResponseDto(invoice);
  }
@Put(':id/pay')
        async payInvoice(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() paymentDto: { paymentMethod: string; cardNumber?: string; cvv?: string; expiryDate?: string }
  ): Promise<any> {
    const command = new PayInvoiceCommand(id, paymentDto.paymentMethod, req.user.id);
    const result = await this.commandBus.execute(command);
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      invoiceId: result.invoice.id.value,
      status: result.invoice.status.value,
      paidAt: result.invoice.paidAt,
      message: result.message,
    };
  }
@Put(':id/cancel')
        async cancelInvoice(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelDto: { reason?: string } = {}
  ): Promise<any> {
    const command = new CancelInvoiceCommand(id, req.user.id, cancelDto.reason);
    const result = await this.commandBus.execute(command);
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      invoiceId: result.invoice.id.value,
      status: result.invoice.status.value,
      cancelledAt: result.invoice.cancelledAt,
      message: result.message,
    };
  }

  // Helper method to map domain entity to response DTO
  private mapToResponseDto(invoice: any): any {
    return {
      id: invoice.id?.value || invoice.id,
      invoiceNumber: invoice.invoiceNumber?.value || invoice.invoiceNumber,
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
