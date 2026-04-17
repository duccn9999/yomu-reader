import type { SelectedData } from "../../models/selected_data";

export type Book = {
  title: string;
  cover: Blob | null;
  content: Map<string, string>;
  notes: { noteId: string; data: SelectedData[] };
};
export class memo_books {
  books: Map<string, Book>;
  constructor() {
    this.books = new Map();
  }
  push(data: { id: string; file: Book }): void {
    this.books.set(data.id, data.file);
  }

  push_list(files: { id: string; book: Book }[]): void {
    files.forEach((file) => {
      this.books.set(file.id, file.book);
    });
  }
  remove(id: string): void {
    this.books.delete(id);
  }

  update(id: string, file: Book): void {
    if (this.books.get(id)) {
      this.books.set(id, file);
    }
  }
}
export const cache = {
  root_folder_id: "",
};
export const MemoBooks = new memo_books();
