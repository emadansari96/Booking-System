export class UpdateResourceItemCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly location?: string,
    public readonly amenities?: string[],
    public readonly images?: string[]
  ) {}
}
