export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  category: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface TodoData {
  todos: Todo[];
  categories: Category[];
  metadata: {
    lastUpdated: string;
    totalTodos: number;
    completedTodos: number;
    version: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type FilterType = "all" | "completed" | "pending";

export interface TodoFormData {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  dueDate: string;
  completed: boolean;
}
