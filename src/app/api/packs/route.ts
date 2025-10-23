import { getPackNames } from '@/utils/game';
import { customDecks } from './custom-deck/route';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const defaultPacks = getPackNames();
    const customPackNames = Array.from(customDecks.keys());
    const allPacks = [...defaultPacks, ...customPackNames];
    return NextResponse.json(allPacks);
  } catch (error) {
    console.error('Error getting packs:', error);
    return NextResponse.json({ error: 'Failed to fetch packs' }, { status: 500 });
  }
}