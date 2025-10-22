import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Directory to store custom decks
const CUSTOM_DECKS_DIR = path.join(process.cwd(), 'custom-decks');

// Ensure the custom decks directory exists
function ensureCustomDecksDir() {
  if (!fs.existsSync(CUSTOM_DECKS_DIR)) {
    fs.mkdirSync(CUSTOM_DECKS_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const words = formData.get('words') as string;
    const deckName = formData.get('deckName') as string;

    if (!words || !deckName) {
      return NextResponse.json(
        { error: 'Missing required fields: words and deckName' },
        { status: 400 }
      );
    }

    // Sanitize deck name to prevent directory traversal
    const sanitizedDeckName = deckName.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    if (!sanitizedDeckName) {
      return NextResponse.json(
        { error: 'Invalid deck name' },
        { status: 400 }
      );
    }

    // Ensure custom decks directory exists
    ensureCustomDecksDir();

    // Check if deck already exists
    const filePath = path.join(CUSTOM_DECKS_DIR, `${sanitizedDeckName}.txt`);
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'A deck with this name already exists' },
        { status: 409 }
      );
    }

    // Process words - split by newlines and filter empty lines
    const wordList = words
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0);

    if (wordList.length === 0) {
      return NextResponse.json(
        { error: 'No valid words provided' },
        { status: 400 }
      );
    }

    // Write the custom deck file
    fs.writeFileSync(filePath, wordList.join('\n'), 'utf8');

    return NextResponse.json({
      success: true,
      deckName: sanitizedDeckName,
      wordCount: wordList.length
    });

  } catch (error) {
    console.error('Error creating custom deck:', error);
    return NextResponse.json(
      { error: 'Failed to create custom deck' },
      { status: 500 }
    );
  }
}
