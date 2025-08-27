import { readTasks, writeTasks } from '@/lib/fileSystem';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tasks = await readTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tasksData = await request.json();
    const result = await writeTasks(tasksData);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}