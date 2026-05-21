export class DownloadFileCommand {
  constructor(
    public readonly userId: string,
    public readonly fileId: string,
  ) {}
}
