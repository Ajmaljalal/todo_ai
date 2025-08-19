import { Todo, TodoData } from '@/types';

export class TodoService {
  static async fetchTodos(): Promise<TodoData> {
    const response = await fetch("/api/todos");
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    return response.json();
  }

  static async createTodo(newTodo: Omit<Todo, "id" | "createdAt" | "updatedAt">): Promise<Todo> {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodo),
    });

    if (!response.ok) {
      throw new Error('Failed to create todo');
    }
    return response.json();
  }

  static async updateTodo(updatedTodo: Todo): Promise<Todo> {
    const response = await fetch("/api/todos", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTodo),
    });

    if (!response.ok) {
      throw new Error('Failed to update todo');
    }
    return response.json();
  }

  static async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`/api/todos?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
  }
}
