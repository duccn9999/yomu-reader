import { useEffect, useState } from "react";
import { MemoBooks } from "../db/memory_db/memory_db";

export function useMemoBooks() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsubscribe = MemoBooks.subscribe(() => {
      forceUpdate((v) => v + 1); // re-render when notified
    });

    return () => {
      unsubscribe(); // ignore the boolean return
    };
  }, []);

  return MemoBooks;
}
