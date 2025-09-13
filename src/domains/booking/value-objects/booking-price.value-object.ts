import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export interface BookingPriceProps {
  basePrice: number;
  commissionAmount: number;
  totalPrice: number;
  currency: string;
}

export class BookingPrice extends ValueObjectBase<BookingPriceProps> {
  constructor(basePrice: number, commissionAmount: number, totalPrice: number, currency: string) {
    if (basePrice < 0) {
      throw new Error('Base price cannot be negative');
    }

    if (commissionAmount < 0) {
      throw new Error('Commission amount cannot be negative');
    }

    if (totalPrice < 0) {
      throw new Error('Total price cannot be negative');
    }

    if (!currency || currency.length !== 3) {
      throw new Error('Currency must be a valid 3-letter code');
    }

    // Validate that total price equals base price + commission (only if not explicitly provided)
    // This validation is now handled in the create method

    super({ basePrice, commissionAmount, totalPrice, currency });
  }

  get basePrice(): number {
    return this.props.basePrice;
  }

  get commissionAmount(): number {
    return this.props.commissionAmount;
  }

  get totalPrice(): number {
    return this.props.totalPrice;
  }

  get currency(): string {
    return this.props.currency;
  }

  public static create(basePrice: number, commissionAmount: number, currency: string, totalPrice?: number): BookingPrice {
    const calculatedTotalPrice = totalPrice || (basePrice + commissionAmount);
    
    // If totalPrice is provided, validate it matches basePrice + commissionAmount
    if (totalPrice !== undefined) {
      const expectedTotal = basePrice + commissionAmount;
      if (Math.abs(totalPrice - expectedTotal) > 0.01) {
        throw new Error(`Total price must equal base price plus commission amount. Expected: ${expectedTotal}, Got: ${totalPrice}`);
      }
    }
    
    return new BookingPrice(basePrice, commissionAmount, calculatedTotalPrice, currency);
  }

  public static fromPersistence(basePrice: number, commissionAmount: number, totalPrice: number, currency: string): BookingPrice {
    return new BookingPrice(basePrice, commissionAmount, totalPrice, currency);
  }

  public getCommissionPercentage(): number {
    if (this.props.basePrice === 0) return 0;
    return (this.props.commissionAmount / this.props.basePrice) * 100;
  }

  public equals(other: BookingPrice): boolean {
    return Math.abs(this.props.basePrice - other.props.basePrice) < 0.01 &&
           Math.abs(this.props.commissionAmount - other.props.commissionAmount) < 0.01 &&
           Math.abs(this.props.totalPrice - other.props.totalPrice) < 0.01 &&
           this.props.currency === other.props.currency;
  }

  public toString(): string {
    return `${this.props.totalPrice} ${this.props.currency} (Base: ${this.props.basePrice}, Commission: ${this.props.commissionAmount})`;
  }
}
