export class GetFileCommand {
  constructor(
    public readonly userId: string,
    public readonly fileId: string,
  ) {}
}
