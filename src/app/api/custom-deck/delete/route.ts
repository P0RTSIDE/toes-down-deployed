import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Directory to store custom decks
const CUSTOM_DECKS_DIR = path.join(process.cwd(), 'custom-decks');

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { deckName } = body;

    if (!deckName) {
      return NextResponse.json(
        { error: 'Missing deckName' },
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

    const filePath = path.join(CUSTOM_DECKS_DIR, `${sanitizedDeckName}.txt`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    // Delete the file
    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      message: 'Deck deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting custom deck:', error);
    return NextResponse.json(
      { error: 'Failed to delete custom deck' },
      { status: 500 }
    );
  }
}
