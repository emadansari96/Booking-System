import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export interface InvoiceNumberProps {
  value: string;
}

export class InvoiceNumber extends ValueObjectBase<InvoiceNumberProps> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Invoice number cannot be empty');
    }
    if (value.length > 50) {
      throw new Error('Invoice number cannot exceed 50 characters');
    }
    super({ value: value.trim() });
  }

  get value(): string {
    return this.props.value;
  }

  public static create(value: string): InvoiceNumber {
    return new InvoiceNumber(value);
  }

  public static fromPersistence(value: string): InvoiceNumber {
    return new InvoiceNumber(value);
  }

  public static generate(): InvoiceNumber {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return new InvoiceNumber(`INV-${timestamp}-${random}`);
  }
}
