import { readMarkdownFiles, writeMarkdownFile, deleteMarkdownFile } from '@/lib/fileSystem';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const directory = searchParams.get('directory');
  
  if (!directory) {
    return NextResponse.json({ error: 'Directory parameter required' }, { status: 400 });
  }
  
  try {
    const files = await readMarkdownFiles(directory);
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { directory, filename, content } = await request.json();
    
    if (!directory || !filename || content === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const result = await writeMarkdownFile(directory, filename, content);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const directory = searchParams.get('directory');
  const filename = searchParams.get('filename');
  
  if (!directory || !filename) {
    return NextResponse.json({ error: 'Directory and filename parameters required' }, { status: 400 });
  }
  
  try {
    const result = await deleteMarkdownFile(directory, filename);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}