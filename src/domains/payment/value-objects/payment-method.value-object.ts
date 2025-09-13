import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export enum PaymentMethodEnum {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
}

export interface PaymentMethodProps {
  value: PaymentMethodEnum;
}

export class PaymentMethod extends ValueObjectBase<PaymentMethodProps> {
  constructor(value: PaymentMethodEnum) {
    if (!Object.values(PaymentMethodEnum).includes(value)) {
      throw new Error(`Invalid payment method: ${value}`);
    }
    super({ value });
  }

  get value(): PaymentMethodEnum {
    return this.props.value;
  }

  public static create(value: PaymentMethodEnum): PaymentMethod {
    return new PaymentMethod(value);
  }

  public static fromPersistence(value: string): PaymentMethod {
    return new PaymentMethod(value as PaymentMethodEnum);
  }

  public isCash(): boolean {
    return this.props.value === PaymentMethodEnum.CASH;
  }

  public requiresApproval(): boolean {
    return this.props.value === PaymentMethodEnum.CASH;
  }
}
