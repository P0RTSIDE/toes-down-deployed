import { getPackItems } from '@/utils/game';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.packs || !Array.isArray(body.packs) || body.packs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Please provide an array of pack names.' },
        { status: 400 }
      );
    }
    
    let allItems: string[] = [];
    for (const packName of body.packs) {
      const items = getPackItems(packName);
      allItems = [...allItems, ...items];
    }
    
    return NextResponse.json(allItems);
  } catch (error) {
    console.error('Error getting pack items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}