import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/databaseService';

// GET - Fetch all todos
export async function GET() {
  try {
    await DatabaseService.initializeDefaultCategories();
    const todoData = await DatabaseService.getAllTodos();
    return NextResponse.json(todoData);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

// POST - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newTodo = await DatabaseService.createTodo(body);
    return NextResponse.json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}

// PUT - Update an existing todo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updatedTodo = await DatabaseService.updateTodo(body);
    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

// DELETE - Delete a todo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Todo ID is required' }, { status: 400 });
    }

    await DatabaseService.deleteTodo(id);
    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}