export type Book = {
  title: string;
  cover: Blob | null;
  content: Map<string, string>;
};
type Listener = () => void;
export class memo_books {
  books: Map<string, Book>;
  private listeners: Set<Listener>;
  constructor() {
    this.books = new Map();
    this.listeners = new Set();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  push(data: { id: string; file: Book }): void {
    this.books.set(data.id, data.file);
    this.notify();
  }

  push_list(files: { id: string; book: Book }[]): void {
    files.forEach((file) => {
      this.books.set(file.id, file.book);
    });
    this.notify();
  }
  remove(id: string): void {
    this.books.delete(id);
    this.notify();
  }

  update(id: string, file: Book): void {
    if (this.books.get(id)) {
      this.books.set(id, file);
      this.notify();
    }
  }
}
export const cache = {
  root_folder_id: "",
};
export const MemoBooks = new memo_books();
