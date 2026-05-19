export class UpdateFileCommand {
  constructor(
    public readonly userId: string,
    public readonly fileId: string,
    public readonly name?: string,
    public readonly folderId?: string | null,
    public readonly isPublic?: boolean,
  ) {}
}
