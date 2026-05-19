export class ReorderFilesCommand {
  constructor(
    public readonly userId: string,
    public readonly items: {
      id: string;
      position: number;
    }[],
  ) {}
}
