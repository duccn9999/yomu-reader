import type { SelectedData } from './selected_data'

export class Metadata {
  readonly lastRead: Date | null
  progress: number
  notes: SelectedData[]

  constructor(progress: number = 0, notes: SelectedData[] = []) {
    this.lastRead = new Date()
    this.progress = progress
    this.notes = notes
  }
}
