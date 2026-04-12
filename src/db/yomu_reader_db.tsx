import type { Theme } from "../models/theme";
import { DefaultValues } from "../utils/default_values";

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

export function getTheme(db: IDBDatabase, id: number): Promise<Theme | null> {
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
export function getThemes(db: IDBDatabase): Promise<Theme[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("themes", "readonly");
    const store = transaction.objectStore("themes");
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
export function addTheme(db: IDBDatabase, theme: Theme) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("themes", "readwrite");
    const store = transaction.objectStore("themes");
    const request = store.add(theme);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function updateTheme(db: IDBDatabase, theme: Theme) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("themes", "readwrite");
    const store = transaction.objectStore("themes");
    const request = store.put(theme);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function deleteTheme(db: IDBDatabase, id: number) {
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
