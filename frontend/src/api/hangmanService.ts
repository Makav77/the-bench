import apiClient from "./apiClient";

export interface DictionaryEntry {
  word: string;
  difficulty: number;
  isEditing?: boolean;
  newWord?: string;
  newDifficulty?: number;
}

export const getWords = async (): Promise<DictionaryEntry[]> => {
    const response = await apiClient.get("/hangman/words");
    return Array.isArray(response.data) ? response.data : [];
};

export const addWord = async (word: string, difficulty: number): Promise<void> => {
    await apiClient.post("/hangman/add-word", { word, difficulty });
};

export const deleteWord = async (word: string): Promise<void> => {
    await apiClient.delete("/hangman/delete-word", { data: { word } });
};

export const updateWord = async (
  oldWord: string,
  newWord?: string,
  difficulty?: number
): Promise<{ success: boolean; result: string }> => {
  const payload: {
    oldWord: string;
    newWord?: string;
    difficulty?: number;
  } = { oldWord };

  if (newWord !== undefined) {
    payload.newWord = newWord;
  }

  if (difficulty !== undefined) {
    payload.difficulty = difficulty;
  }

  const response = await apiClient.patch("/hangman/update-word", payload);
  return response.data;
};