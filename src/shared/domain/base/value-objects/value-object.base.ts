export abstract class ValueObjectBase<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = props;
  }

  equals(vo?: ValueObjectBase<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (this === vo) {
      return true;
    }
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}