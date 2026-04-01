import type { ReadingStyle } from "../models/reading_style";

export function OpenDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("db", 1);
    request.onupgradeneeded = (event) => {
      const req = event.target as IDBOpenDBRequest;
      const db = req.result;
      const tx = req.transaction!;

      if (!db.objectStoreNames.contains("books")) {
        const books = db.createObjectStore("books", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains("themes")) {
        db.createObjectStore("themes", {
          keyPath: "id",
        });

        const store = tx.objectStore("themes");
        store.put({
          id: 1,
          txtColor: "#000000",
          bgColor: "#ffffff",
          txtAlign: "justify",
          padding: "1em",
          margin: "1em",
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
        });
        tx.oncomplete = () => {
          console.log("Default theme added");
        };
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

export function addBook(db: IDBDatabase, book: any) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    const store = transaction.objectStore("books");
    const request = store.add(book);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function getBooks(db: IDBDatabase) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readonly");
    const store = transaction.objectStore("books");
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function getTheme(
  db: IDBDatabase,
  id: number,
): Promise<ReadingStyle | null> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("themes", "readonly");
    const store = transaction.objectStore("themes");
    if (!id) id = 1;
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
