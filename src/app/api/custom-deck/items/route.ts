import { NextRequest, NextResponse } from 'next/server';
import { customDecks } from '../custom-deck/route';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deckName = searchParams.get('deckName');

    if (!deckName) {
      return NextResponse.json(
        { error: 'Missing deckName parameter' },
        { status: 400 }
      );
    }

    // Check if it's a custom deck
    if (customDecks.has(deckName)) {
      const words = customDecks.get(deckName) || [];
      return NextResponse.json(words);
    }

    // If not a custom deck, return empty array
    // The frontend will handle getting default pack items separately
    return NextResponse.json([]);

  } catch (error) {
    console.error('Error getting custom deck items:', error);
    return NextResponse.json(
      { error: 'Failed to get custom deck items' },
      { status: 500 }
    );
  }
}
