import { getPackNames } from '@/utils/game';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const packs = getPackNames();
    return NextResponse.json(packs);
  } catch (error) {
    console.error('Error getting packs:', error);
    return NextResponse.json({ error: 'Failed to fetch packs' }, { status: 500 });
  }
}