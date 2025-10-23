import fs from 'fs';
import path from 'path';

// Function to get all available pack names (default packs only)
export const getPackNames = (): string[] => {
  const dataDirectory = path.join(process.cwd(), 'src/data');
  
  try {
    const fileNames = fs.readdirSync(dataDirectory);
    return fileNames
      .filter(fileName => fileName.endsWith('.txt'))
      .map(fileName => fileName.replace(/\.txt$/, ''));
  } catch (error) {
    console.error('Error reading data directory:', error);
    return [];
  }
};

// Function to get items from a specific pack (default packs only)
export const getPackItems = (packName: string): string[] => {
  const filePath = path.join(process.cwd(), `src/data/${packName}.txt`);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent.split('\n').filter(item => item.trim() !== '');
  } catch (error) {
    console.error(`Error reading pack ${packName}:`, error);
    return [];
  }
};

// Types for our game
export type GameState = 'selecting' | 'ready' | 'playing' | 'finished';

export interface GameSettings {
  selectedPacks: string[];
  timeLimit: number; // in seconds
}

export interface GameScore {
  correct: number;
  skipped: number;
  items: {
    text: string;
    status: 'correct' | 'skipped';
  }[];
}