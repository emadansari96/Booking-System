export class DeleteOldLogsCommand {
  constructor(
    public readonly beforeDate: Date,
  ) {}
}
