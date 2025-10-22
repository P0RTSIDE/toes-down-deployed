import fs from 'fs';
import path from 'path';

// Function to get all available pack names
export const getPackNames = (): string[] => {
  const dataDirectory = path.join(process.cwd(), 'src/data');
  const customDecksDirectory = path.join(process.cwd(), 'custom-decks');
  
  let packNames: string[] = [];
  
  // Get default packs from src/data
  try {
    const fileNames = fs.readdirSync(dataDirectory);
    packNames = fileNames
      .filter(fileName => fileName.endsWith('.txt'))
      .map(fileName => fileName.replace(/\.txt$/, ''));
  } catch (error) {
    console.error('Error reading data directory:', error);
  }
  
  // Get custom decks from custom-decks directory
  try {
    if (fs.existsSync(customDecksDirectory)) {
      const customFileNames = fs.readdirSync(customDecksDirectory);
      const customPacks = customFileNames
        .filter(fileName => fileName.endsWith('.txt'))
        .map(fileName => fileName.replace(/\.txt$/, ''));
      packNames = [...packNames, ...customPacks];
    }
  } catch (error) {
    console.error('Error reading custom decks directory:', error);
  }
  
  return packNames;
};

// Function to get items from a specific pack
export const getPackItems = (packName: string): string[] => {
  // First try the default data directory
  const defaultFilePath = path.join(process.cwd(), `src/data/${packName}.txt`);
  try {
    if (fs.existsSync(defaultFilePath)) {
      const fileContent = fs.readFileSync(defaultFilePath, 'utf8');
      return fileContent.split('\n').filter(item => item.trim() !== '');
    }
  } catch (error) {
    console.error(`Error reading default pack ${packName}:`, error);
  }
  
  // If not found in default directory, try custom decks directory
  const customFilePath = path.join(process.cwd(), `custom-decks/${packName}.txt`);
  try {
    if (fs.existsSync(customFilePath)) {
      const fileContent = fs.readFileSync(customFilePath, 'utf8');
      return fileContent.split('\n').filter(item => item.trim() !== '');
    }
  } catch (error) {
    console.error(`Error reading custom pack ${packName}:`, error);
  }
  
  console.error(`Pack ${packName} not found in either directory`);
  return [];
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