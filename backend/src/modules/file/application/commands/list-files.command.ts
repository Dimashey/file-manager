export class ListFilesCommand {
  constructor(
    public readonly userId: string,
    public readonly folderId?: string,
  ) {}
}
