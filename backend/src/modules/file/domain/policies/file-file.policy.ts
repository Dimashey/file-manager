export abstract class FileMovePolicy {
  abstract canMoveToFolder(folderId: string | null): Promise<boolean>;
}
