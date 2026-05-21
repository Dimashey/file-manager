export class UpdateFolderCommand {
  constructor(
    public readonly userId: string,
    public readonly folderId: string,
    public readonly name?: string,
    public readonly parentId?: string | null,
    public readonly isPublic?: boolean,
  ) {}
}
