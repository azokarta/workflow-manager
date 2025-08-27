import { initializeClaudeStructure } from '@/lib/fileSystem';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const result = await initializeClaudeStructure();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}