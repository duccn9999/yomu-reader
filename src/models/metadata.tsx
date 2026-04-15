import type { SelectedData } from "./selected_data";

export class Metadata {
  readonly lastRead: Date | null;
  progress: number;
  notes: SelectedData[];

  constructor(lastRead: Date | null, progress: number, notes: SelectedData[]) {
    this.lastRead = lastRead;
    this.progress = progress;
    this.notes = notes;
  }
}
