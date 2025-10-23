import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for custom decks
// In a production app, you'd want to use a database like MongoDB, PostgreSQL, etc.
const customDecks = new Map<string, string[]>();

// Export the customDecks map so other API routes can access it
export { customDecks };

export async function GET() {
  try {
    // Return all custom deck names
    const deckNames = Array.from(customDecks.keys());
    return NextResponse.json(deckNames);
  } catch (error) {
    console.error('Error getting custom decks:', error);
    return NextResponse.json(
      { error: 'Failed to get custom decks' },
      { status: 500 }
    );
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

    // Check if deck already exists
    if (customDecks.has(sanitizedDeckName)) {
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

    // Store the custom deck in memory
    customDecks.set(sanitizedDeckName, wordList);

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
