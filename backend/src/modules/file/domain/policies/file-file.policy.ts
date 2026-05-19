export abstract class FileMovePolicy {
  abstract canMoveToFolder(folderId: string | null, userId: string): Promise<boolean>;
}
