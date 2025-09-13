import { ValueObjectBase } from './value-object.base';
import { randomUUID } from 'crypto';
export interface UuidValueObjectProps {
  value: string;
}

export class UuidValueObject extends ValueObjectBase<UuidValueObjectProps> {
  constructor(props: UuidValueObjectProps) {
    super(props);
  }

  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static fromString(value: string): UuidValueObject {
    if (!UuidValueObject.isValidUUID(value)) {
      throw new Error('Invalid UUID format');
    }
    return new UuidValueObject({ value });
  }

  static generate(): UuidValueObject {
    const uuid = randomUUID();
    return new UuidValueObject({ value: uuid });
  }

  get value(): string {
    return this.props.value;
  }
}