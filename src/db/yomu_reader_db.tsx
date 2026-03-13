export function OpenDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("db", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("books")) {
        db.createObjectStore("books", { keyPath: "id", autoIncrement: true });
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
