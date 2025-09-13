import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentRepositoryInterface, PaymentSearchCriteria, PaymentSearchResult } from '../../../../domains/payment/interfaces/payment-repository.interface';
import { PaymentEntity } from '../../../../domains/payment/entities/payment.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { PaymentMethod } from '../../../../domains/payment/value-objects/payment-method.value-object';
import { PaymentStatus } from '../../../../domains/payment/value-objects/payment-status.value-object';
import { PaymentAmount } from '../../../../domains/payment/value-objects/payment-amount.value-object';
import { Currency } from '../../../../domains/payment/value-objects/currency.value-object';
import { PaymentMethod as PrismaPaymentMethod, PaymentStatus as PrismaPaymentStatus, Currency as PrismaCurrency } from '@prisma/client';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: PaymentEntity): Promise<PaymentEntity> {
    const paymentData = {
      id: entity.id.value,
      userId: entity.userId.value,
      invoiceId: entity.invoiceId.value,
      method: entity.method.value as PrismaPaymentMethod,
      status: entity.status.value as PrismaPaymentStatus,
      amount: entity.amount.value,
      currency: entity.currency.value as PrismaCurrency,
      description: entity.description,
      reference: entity.reference,
      metadata: entity.metadata,
      approvedBy: entity.approvedBy?.value,
      approvedAt: entity.approvedAt,
      completedAt: entity.completedAt,
      failedAt: entity.failedAt,
      cancelledAt: entity.cancelledAt,
      refundedAt: entity.refundedAt,
      failureReason: entity.failureReason,
    };

    const savedPayment = await this.prisma.payment.upsert({
      where: { id: paymentData.id },
      create: paymentData,
      update: paymentData,
    });

    return this.toDomainEntity(savedPayment);
  }

  async findById(id: UuidValueObject): Promise<PaymentEntity | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: id.value },
    });

    return payment ? this.toDomainEntity(payment) : null;
  }

  async findByUserId(userId: UuidValueObject): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { userId: userId.value },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findByInvoiceId(invoiceId: UuidValueObject): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { invoiceId: invoiceId.value },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findByStatus(status: string): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { status: status as PrismaPaymentStatus },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findByMethod(method: string): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { method: method as PrismaPaymentMethod },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findByDateRange(startDate?: Date, endDate?: Date): Promise<PaymentEntity[]> {
    const where: any = {};
    if (startDate) {
      where.createdAt = { gte: startDate };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: endDate };
    }

    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findByAmountRange(minAmount: number, maxAmount: number): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { 
        amount: { 
          gte: minAmount,
          lte: maxAmount
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findPendingPayments(): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { status: PrismaPaymentStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findApprovedPayments(): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { status: PrismaPaymentStatus.APPROVED },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findCompletedPayments(): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { status: PrismaPaymentStatus.COMPLETED },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findFailedPayments(): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { status: PrismaPaymentStatus.FAILED },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findCancelledPayments(): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { status: PrismaPaymentStatus.CANCELLED },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findRefundedPayments(): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { status: PrismaPaymentStatus.REFUNDED },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async search(criteria: PaymentSearchCriteria): Promise<PaymentSearchResult> {
    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const where: any = {};

    if (criteria.userId) {
      where.userId = criteria.userId.value;
    }
    if (criteria.invoiceId) {
      where.invoiceId = criteria.invoiceId.value;
    }
    if (criteria.status) {
      where.status = criteria.status as PrismaPaymentStatus;
    }
    if (criteria.method) {
      where.method = criteria.method as PrismaPaymentMethod;
    }
    if (criteria.currency) {
      where.currency = criteria.currency as PrismaCurrency;
    }
    if (criteria.minAmount !== undefined) {
      where.amount = { gte: criteria.minAmount };
    }
    if (criteria.maxAmount !== undefined) {
      where.amount = { ...where.amount, lte: criteria.maxAmount };
    }
    if (criteria.startDate) {
      where.createdAt = { gte: criteria.startDate };
    }
    if (criteria.endDate) {
      where.createdAt = { ...where.createdAt, lte: criteria.endDate };
    }

    const total = await this.prisma.payment.count({ where });
    
    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      payments: payments.map(payment => this.toDomainEntity(payment)),
      total,
      page,
      limit,
    };
  }

  async findByReference(reference: string): Promise<PaymentEntity | null> {
    const payment = await this.prisma.payment.findFirst({
      where: { reference },
    });

    return payment ? this.toDomainEntity(payment) : null;
  }

  async findPaymentsRequiringApproval(): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { 
        status: PrismaPaymentStatus.PENDING,
        method: PrismaPaymentMethod.CASH
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async findAll(): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(payment => this.toDomainEntity(payment));
  }

  async delete(id: UuidValueObject): Promise<void> {
    await this.prisma.payment.delete({
      where: { id: id.value },
    });
  }

  private toDomainEntity(prismaPayment: any): PaymentEntity {
    return PaymentEntity.fromPersistence({
      id: UuidValueObject.fromString(prismaPayment.id),
      userId: UuidValueObject.fromString(prismaPayment.userId),
      invoiceId: UuidValueObject.fromString(prismaPayment.invoiceId),
      method: PaymentMethod.fromPersistence(prismaPayment.method),
      status: PaymentStatus.fromPersistence(prismaPayment.status),
      amount: PaymentAmount.fromPersistence(prismaPayment.amount),
      currency: Currency.fromPersistence(prismaPayment.currency),
      description: prismaPayment.description,
      reference: prismaPayment.reference,
      metadata: prismaPayment.metadata,
      approvedBy: prismaPayment.approvedBy ? UuidValueObject.fromString(prismaPayment.approvedBy) : undefined,
      approvedAt: prismaPayment.approvedAt,
      completedAt: prismaPayment.completedAt,
      failedAt: prismaPayment.failedAt,
      cancelledAt: prismaPayment.cancelledAt,
      refundedAt: prismaPayment.refundedAt,
      failureReason: prismaPayment.failureReason,
      createdAt: prismaPayment.createdAt,
      updatedAt: prismaPayment.updatedAt,
    });
  }
}
