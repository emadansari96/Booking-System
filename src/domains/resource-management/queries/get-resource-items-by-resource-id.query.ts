export class GetResourceItemsByResourceIdQuery {
  constructor(
    public readonly resourceId: string,
    public readonly status?: string,
    public readonly type?: string,
    public readonly isActive?: boolean
  ) {}
}
