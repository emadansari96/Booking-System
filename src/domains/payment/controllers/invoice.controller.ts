import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetInvoiceByIdQuery } from '../queries/get-invoice-by-id.query';
import { GetInvoicesQuery } from '../queries/get-invoices.query';
import {
  InvoiceResponseDto,
  InvoiceListResponseDto,
} from '../dtos/invoice.dto';

@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  async getInvoiceById(@Param('id') id: string): Promise<InvoiceResponseDto> {
    const query = new GetInvoiceByIdQuery(id);
    return await this.queryBus.execute(query);
  }

  @Get()
  async getInvoices(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('currency') currency?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dueDateStart') dueDateStart?: string,
    @Query('dueDateEnd') dueDateEnd?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<InvoiceListResponseDto> {
    const query = new GetInvoicesQuery(
      userId,
      status,
      currency,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      dueDateStart ? new Date(dueDateStart) : undefined,
      dueDateEnd ? new Date(dueDateEnd) : undefined,
      page,
      limit
    );
    return await this.queryBus.execute(query);
  }
}
