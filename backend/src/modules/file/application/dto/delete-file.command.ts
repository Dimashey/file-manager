export class DeleteFileCommand {
  constructor(
    public readonly userId: string,
    public readonly fileId: string,
  ) {}
}
