import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { InvoiceRepositoryInterface, InvoiceSearchCriteria, InvoiceSearchResult } from '../../../../domains/payment/interfaces/invoice-repository.interface';
import { InvoiceEntity } from '../../../../domains/payment/entities/invoice.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { InvoiceNumber } from '../../../../domains/payment/value-objects/invoice-number.value-object';
import { InvoiceStatus } from '../../../../domains/payment/value-objects/invoice-status.value-object';
import { PaymentAmount } from '../../../../domains/payment/value-objects/payment-amount.value-object';
import { Currency } from '../../../../domains/payment/value-objects/currency.value-object';
import { InvoiceItem } from '../../../../domains/payment/value-objects/invoice-item.value-object';
import { InvoiceStatus as PrismaInvoiceStatus, Currency as PrismaCurrency } from '@prisma/client';
@Injectable()
export class PrismaInvoiceRepository implements InvoiceRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: InvoiceEntity): Promise<InvoiceEntity> {
    const invoiceData = {
      id: entity.id.value,
      invoiceNumber: entity.invoiceNumber.value,
      userId: entity.userId.value,
      status: entity.status.value as PrismaInvoiceStatus,
      subtotal: entity.subtotal.value,
      taxAmount: entity.taxAmount.value,
      discountAmount: entity.discountAmount.value,
      totalAmount: entity.totalAmount.value,
      currency: entity.currency.value as PrismaCurrency,
      dueDate: entity.dueDate,
      paidAt: entity.paidAt,
      cancelledAt: entity.cancelledAt,
      refundedAt: entity.refundedAt,
      notes: entity.notes,
      metadata: entity.metadata,
    };

    const savedInvoice = await this.prisma.invoice.upsert({
      where: { id: invoiceData.id },
      create: invoiceData,
      update: invoiceData,
    });

    // Save invoice items
    for (const item of entity.items) {
      await this.prisma.invoiceItem.upsert({
        where: { id: item.id.value },
        create: {
          id: item.id.value,
          invoiceId: entity.id.value,
          resourceId: item.resourceId.value,
          resourceItemId: item.resourceItemId?.value,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice.value,
          totalPrice: item.totalPrice.value,
          metadata: item.metadata,
        },
        update: {
          resourceId: item.resourceId.value,
          resourceItemId: item.resourceItemId?.value,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice.value,
          totalPrice: item.totalPrice.value,
          metadata: item.metadata,
        },
      });
    }

    return this.toDomainEntity(savedInvoice);
  }

  async findById(id: UuidValueObject): Promise<InvoiceEntity | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: id.value },
      include: { items: true },
    });

    return invoice ? this.toDomainEntity(invoice) : null;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<InvoiceEntity | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: { items: true },
    });

    return invoice ? this.toDomainEntity(invoice) : null;
  }

  async findByUserId(userId: UuidValueObject): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { userId: userId.value },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findByStatus(status: string): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { status: status as PrismaInvoiceStatus },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findByDateRange(startDate?: Date, endDate?: Date): Promise<InvoiceEntity[]> {
    const where: any = {};
    if (startDate) {
      where.createdAt = { gte: startDate };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: endDate };
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findByDueDateRange(startDate: Date, endDate: Date): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { 
        dueDate: { 
          gte: startDate,
          lte: endDate
        }
      },
      include: { items: true },
      orderBy: { dueDate: 'asc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findByAmountRange(minAmount: number, maxAmount: number): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { 
        totalAmount: { 
          gte: minAmount,
          lte: maxAmount
        }
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findDraftInvoices(): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { status: PrismaInvoiceStatus.DRAFT },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findPendingInvoices(): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { status: PrismaInvoiceStatus.PENDING },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findPaidInvoices(): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { status: PrismaInvoiceStatus.PAID },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findOverdueInvoices(): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { 
        status: PrismaInvoiceStatus.PENDING,
        dueDate: { lt: new Date() }
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findCancelledInvoices(): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { status: PrismaInvoiceStatus.CANCELLED },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findRefundedInvoices(): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { status: PrismaInvoiceStatus.REFUNDED },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async search(criteria: InvoiceSearchCriteria): Promise<InvoiceSearchResult> {
    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const where: any = {};

    if (criteria.userId) {
      where.userId = criteria.userId.value;
    }
    if (criteria.status) {
      where.status = criteria.status as PrismaInvoiceStatus;
    }
    if (criteria.currency) {
      where.currency = criteria.currency as PrismaCurrency;
    }
    if (criteria.minAmount !== undefined) {
      where.totalAmount = { gte: criteria.minAmount };
    }
    if (criteria.maxAmount !== undefined) {
      where.totalAmount = { ...where.totalAmount, lte: criteria.maxAmount };
    }
    if (criteria.startDate) {
      where.createdAt = { gte: criteria.startDate };
    }
    if (criteria.endDate) {
      where.createdAt = { ...where.createdAt, lte: criteria.endDate };
    }
    if (criteria.dueDateStart) {
      where.dueDate = { gte: criteria.dueDateStart };
    }
    if (criteria.dueDateEnd) {
      where.dueDate = { ...where.dueDate, lte: criteria.dueDateEnd };
    }

    const total = await this.prisma.invoice.count({ where });
    
    const invoices = await this.prisma.invoice.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      invoices: invoices.map(invoice => this.toDomainEntity(invoice)),
      total,
      page,
      limit,
    };
  }

  async findInvoicesByResourceId(resourceId: UuidValueObject): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { 
        items: {
          some: {
            resourceId: resourceId.value
          }
        }
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findInvoicesByResourceItemId(resourceItemId: UuidValueObject): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { 
        items: {
          some: {
            resourceItemId: resourceItemId.value
          }
        }
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async findAll(): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.toDomainEntity(invoice));
  }

  async delete(id: UuidValueObject): Promise<void> {
    // Delete invoice items first
    await this.prisma.invoiceItem.deleteMany({
      where: { invoiceId: id.value },
    });

    // Delete invoice
    await this.prisma.invoice.delete({
      where: { id: id.value },
    });
  }

  private toDomainEntity(prismaInvoice: any): InvoiceEntity {
    const items = prismaInvoice.items?.map((item: any) => 
      InvoiceItem.fromPersistence({
        id: UuidValueObject.fromString(item.id),
        resourceId: UuidValueObject.fromString(item.resourceId),
        resourceItemId: item.resourceItemId ? UuidValueObject.fromString(item.resourceItemId) : undefined,
        description: item.description,
        quantity: item.quantity,
        unitPrice: PaymentAmount.fromPersistence(item.unitPrice),
        totalPrice: PaymentAmount.fromPersistence(item.totalPrice),
        metadata: item.metadata,
      })
    ) || [];

    return InvoiceEntity.fromPersistence({
      id: UuidValueObject.fromString(prismaInvoice.id),
      invoiceNumber: InvoiceNumber.fromPersistence(prismaInvoice.invoiceNumber),
      userId: UuidValueObject.fromString(prismaInvoice.userId),
      status: InvoiceStatus.fromPersistence(prismaInvoice.status),
      items,
      subtotal: PaymentAmount.fromPersistence(prismaInvoice.subtotal),
      taxAmount: PaymentAmount.fromPersistence(prismaInvoice.taxAmount),
      discountAmount: PaymentAmount.fromPersistence(prismaInvoice.discountAmount),
      totalAmount: PaymentAmount.fromPersistence(prismaInvoice.totalAmount),
      currency: Currency.fromPersistence(prismaInvoice.currency),
      dueDate: prismaInvoice.dueDate,
      paidAt: prismaInvoice.paidAt,
      cancelledAt: prismaInvoice.cancelledAt,
      refundedAt: prismaInvoice.refundedAt,
      notes: prismaInvoice.notes,
      metadata: prismaInvoice.metadata,
      createdAt: prismaInvoice.createdAt,
      updatedAt: prismaInvoice.updatedAt,
    });
  }
}
