import { HttpException, HttpStatus } from '@nestjs/common';
export class PaymentNotFoundException extends HttpException {
  constructor(paymentId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Payment not found',
        error: 'PAYMENT_NOT_FOUND',
        details: { paymentId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class PaymentAlreadyProcessedException extends HttpException {
  constructor(paymentId: string, status: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Payment has already been processed',
        error: 'PAYMENT_ALREADY_PROCESSED',
        details: { paymentId, currentStatus: status }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class PaymentAmountMismatchException extends HttpException {
  constructor(expectedAmount: number, actualAmount: number) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Payment amount does not match expected amount',
        error: 'PAYMENT_AMOUNT_MISMATCH',
        details: { expectedAmount, actualAmount }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class PaymentMethodNotSupportedException extends HttpException {
  constructor(paymentMethod: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Payment method is not supported',
        error: 'PAYMENT_METHOD_NOT_SUPPORTED',
        details: { paymentMethod }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvoiceNotFoundException extends HttpException {
  constructor(invoiceId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Invoice not found',
        error: 'INVOICE_NOT_FOUND',
        details: { invoiceId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class InvoiceAlreadyPaidException extends HttpException {
  constructor(invoiceId: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invoice has already been paid',
        error: 'INVOICE_ALREADY_PAID',
        details: { invoiceId }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvoiceExpiredException extends HttpException {
  constructor(invoiceId: string) {
    super(
      {
        statusCode: HttpStatus.GONE,
        message: 'Invoice has expired',
        error: 'INVOICE_EXPIRED',
        details: { invoiceId }
      },
      HttpStatus.GONE
    );
  }
}

