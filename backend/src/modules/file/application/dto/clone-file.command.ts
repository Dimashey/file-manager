export class CloneFileCommand {
  constructor(
    public readonly userId: string,
    public readonly fileId: string,
  ) {}
}
