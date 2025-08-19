import { Todo, Category } from '@/types';

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-800 border-red-200";
    case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low": return "bg-green-100 text-green-800 border-green-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getCategoryColor = (categoryId: string, categories: Category[]): string => {
  const category = categories.find(c => c.id === categoryId);
  return category?.color || "#6B7280";
};

export const createTempTodo = (newTodo: Omit<Todo, "id" | "createdAt" | "updatedAt">): Todo => {
  const now = new Date().toISOString();
  return {
    id: `temp-${Date.now()}`,
    title: newTodo.title,
    description: newTodo.description,
    completed: newTodo.completed || false,
    priority: newTodo.priority,
    category: newTodo.category,
    dueDate: newTodo.dueDate,
    createdAt: now,
    updatedAt: now
  };
};

export const updateTodoMetadata = (todos: Todo[]) => {
  return {
    lastUpdated: new Date().toISOString(),
    totalTodos: todos.length,
    completedTodos: todos.filter(t => t.completed).length,
    version: "1.0.0"
  };
};

export const getDefaultTodoData = () => ({
  todos: [],
  categories: [
    { id: "work", name: "Work", color: "#3B82F6" },
    { id: "personal", name: "Personal", color: "#10B981" },
    { id: "health", name: "Health", color: "#EF4444" },
    { id: "learning", name: "Learning", color: "#8B5CF6" }
  ],
  metadata: updateTodoMetadata([])
});
