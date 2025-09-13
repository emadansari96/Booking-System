import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export interface ResourcePriceProps {
  value: number;
  currency: string;
}

export class ResourcePrice extends ValueObjectBase<ResourcePriceProps> {
  constructor(props: ResourcePriceProps) {
    super(props);
  }

  public static create(value: number, currency: string = 'USD'): ResourcePrice {
    if (value < 0) {
      throw new Error('Resource price cannot be negative');
    }

    if (value > 1000000) {
      throw new Error('Resource price cannot exceed 1,000,000');
    }

    if (!currency || currency.trim().length === 0) {
      throw new Error('Currency cannot be empty');
    }

    if (currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code');
    }

    return new ResourcePrice({ 
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
      currency: currency.toUpperCase().trim()
    });
  }

  public static fromPersistence(value: number, currency: string): ResourcePrice {
    // Handle NaN or invalid values
    if (isNaN(value) || value === null || value === undefined) {
      value = 0;
    }
    
    // Handle invalid currency
    if (!currency || currency.trim().length === 0) {
      currency = 'USD';
    }
    
    return new ResourcePrice({ 
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
      currency: currency.toUpperCase().trim()
    });
  }

  get value(): number {
    return this.props.value;
  }

  get currency(): string {
    return this.props.currency;
  }
}
