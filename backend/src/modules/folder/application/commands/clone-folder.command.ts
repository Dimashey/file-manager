export class CloneFolderCommand {
  constructor(
    public readonly userId: string,
    public readonly folderId: string,
  ) {}
}
