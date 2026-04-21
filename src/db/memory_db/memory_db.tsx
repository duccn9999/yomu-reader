import type { SelectedData } from "../../models/selected_data";

export type Book = {
  title: string;
  cover: Blob | null;
  content: Map<string, string>;
  notes: { noteId: string; data: SelectedData[] };
  parents?: string[];
};
export const cache = {
  root_folder_id: "",
};
