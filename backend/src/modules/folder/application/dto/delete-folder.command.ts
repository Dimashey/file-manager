export class DeleteFolderCommand {
  constructor(
    public readonly userId: string,
    public readonly folderId: string,
  ) {}
}
