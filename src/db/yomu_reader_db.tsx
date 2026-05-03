import type { BookContent } from "../models/book_content";
import type { Theme } from "../models/theme";
import { DefaultValues } from "../utils/default_values";
import type { Book } from "./memory_db/memory_db";
export class Db {
  static async OpenDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("db", 2);
      request.onupgradeneeded = (event) => {
        const req = event.target as IDBOpenDBRequest;
        const db = req.result;
        const tx = req.transaction!;

        if (!db.objectStoreNames.contains("books")) {
          db.createObjectStore("books", {
            keyPath: "id",
          });
        }
        if (!db.objectStoreNames.contains("themes")) {
          db.createObjectStore("themes", {
            keyPath: "id",
            autoIncrement: true,
          });

          const store = tx.objectStore("themes");
          store.put(DefaultValues.lightTheme);
          store.put(DefaultValues.darkTheme);
          tx.oncomplete = () => {
            console.log("Default themes added");
          };
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  static async addBook(db: IDBDatabase, book: BookContent) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("books", "readwrite");
      const store = transaction.objectStore("books");

      const checkRequest = store.get(book.id);

      checkRequest.onsuccess = () => {
        if (checkRequest.result) {
          // already exists
          resolve("Book already exists");
          return;
        }

        const addRequest = store.add(book);

        addRequest.onsuccess = () => {
          resolve(addRequest.result);
        };

        addRequest.onerror = () => {
          reject(addRequest.error);
          db.close();
        };
      };

      checkRequest.onerror = () => {
        reject(checkRequest.error);
        db.close();
      };
    });
  }

  static async getBooks(db: IDBDatabase): Promise<BookContent[]> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("books", "readonly");
      const store = transaction.objectStore("books");
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  static async getBook(db: IDBDatabase, id: string): Promise<BookContent> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("books", "readonly");
      const store = transaction.objectStore("books");
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  static async updateBook(db: IDBDatabase, bookContent: BookContent) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("books", "readwrite");
      const store = transaction.objectStore("books");
      const request = store.put(bookContent);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  static async deleteBook(db: IDBDatabase, id: string) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("books", "readwrite");
      const store = transaction.objectStore("books");
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  static async getTheme(db: IDBDatabase, id: number): Promise<Theme | null> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("themes", "readonly");
      const store = transaction.objectStore("themes");
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  static async getThemes(db: IDBDatabase): Promise<Theme[]> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("themes", "readonly");
      const store = transaction.objectStore("themes");
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  static async addTheme(db: IDBDatabase, theme: Theme) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("themes", "readwrite");
      const store = transaction.objectStore("themes");
      const request = store.add(theme);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  static async updateTheme(db: IDBDatabase, theme: Theme) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("themes", "readwrite");
      const store = transaction.objectStore("themes");
      const request = store.put(theme);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  }

  static async deleteTheme(db: IDBDatabase, id: number) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("themes", "readwrite");
      const store = transaction.objectStore("themes");
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}
