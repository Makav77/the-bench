import { Injectable } from '@nestjs/common';
import { runSQLWithInterpreter } from '../../utils/interpreterRunner';

@Injectable()
export class HangmanService {
    async getAllWords(): Promise<{ word: string; difficulty: number }[]> {
        const raw = await runSQLWithInterpreter(`SELECT * FROM dictionary`);

        console.log("Raw interpreter output:", raw);

        try {
            const jsonLike = raw.replace(/'/g, '"');
            const parsed = JSON.parse(jsonLike);

            if (Array.isArray(parsed)) {
                return parsed;
            } else {
                throw new Error("Expected array");
            }
        } catch (e) {
            console.error("Failed to parse interpreter response:", raw, e);
            return [];
        }
    }


    async addWord(word: string, difficulty: number): Promise<string> {
        const safeWord = word.replace(/"/g, '\\"');
        const sql = `INSERT INTO dictionary VALUES {"word": "${safeWord}", "difficulty": ${difficulty}}`;
        return await runSQLWithInterpreter(sql);
    }

    async updateWord(oldWord: string, newWord?: string, difficulty?: number): Promise<string> {
        const updates: string[] = [];

        if (!newWord && difficulty === undefined) {
            throw new Error("Nothing to update.");
        }

        if (newWord) {
            const safeNewWord = newWord.replace(/"/g, '\\"');
            const safeOldWord = oldWord.replace(/"/g, '\\"');
            const sql = `UPDATE dictionary SET word = "${safeNewWord}" WHERE word = "${safeOldWord}"`;
            await runSQLWithInterpreter(sql);
            updates.push('word');
        }

        if (difficulty !== undefined) {
            const safeTargetWord = newWord ?? oldWord;
            const safeWord = safeTargetWord.replace(/"/g, '\\"');
            const sql = `UPDATE dictionary SET difficulty = ${difficulty} WHERE word = "${safeWord}"`;
            await runSQLWithInterpreter(sql);
            updates.push('difficulty');
        }

        return `Updated: ${updates.join(', ')}`;
    }

    async deleteWord(word: string): Promise<string> {
        const sql = `DELETE FROM dictionary WHERE word = "${word.replace(/"/g, '\\"')}"`;
        return await runSQLWithInterpreter(sql);
    }
}
