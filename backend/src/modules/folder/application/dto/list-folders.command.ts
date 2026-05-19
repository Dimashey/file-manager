export class ListFoldersCommand {
  constructor(
    public readonly userId: string,
    public readonly parentId?: string,
  ) {}
}
