export class GetFolderCommand {
  constructor(
    public readonly userId: string,
    public readonly folderId: string,
  ) {}
}
