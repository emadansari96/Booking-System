import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export enum CurrencyEnum {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  IRR = 'IRR',
  AED = 'AED',
}

export interface CurrencyProps {
  value: CurrencyEnum;
}

export class Currency extends ValueObjectBase<CurrencyProps> {
  constructor(value: CurrencyEnum) {
    if (!Object.values(CurrencyEnum).includes(value)) {
      throw new Error(`Invalid currency: ${value}`);
    }
    super({ value });
  }

  get value(): CurrencyEnum {
    return this.props.value;
  }

  public static create(value: CurrencyEnum): Currency {
    return new Currency(value);
  }

  public static fromPersistence(value: string): Currency {
    return new Currency(value as CurrencyEnum);
  }

  public getSymbol(): string {
    const symbols = {
      [CurrencyEnum.USD]: '$',
      [CurrencyEnum.EUR]: '€',
      [CurrencyEnum.GBP]: '£',
      [CurrencyEnum.IRR]: 'ریال',
      [CurrencyEnum.AED]: 'د.ا',
    };
    return symbols[this.props.value];
  }

  public getCode(): string {
    return this.props.value;
  }
}
