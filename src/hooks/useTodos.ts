import { useState, useEffect, useCallback } from 'react';
import { Todo, TodoData, FilterType } from '@/types';
import { TodoService } from '@/services/todoService';
import { createTempTodo, updateTodoMetadata, getDefaultTodoData } from '@/utils/todoUtils';

export const useTodos = () => {
  const [todoData, setTodoData] = useState<TodoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const loadTodos = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      }
      const data = await TodoService.fetchTodos();
      setTodoData(data);
    } catch (error) {
      console.error("Failed to load todos:", error);
      setTodoData(getDefaultTodoData());
    } finally {
      if (showLoadingState) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const createTodo = useCallback(async (newTodo: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    try {
      const tempTodo = createTempTodo(newTodo);

      if (todoData) {
        setTodoData({
          ...todoData,
          todos: [...todoData.todos, tempTodo],
          metadata: updateTodoMetadata([...todoData.todos, tempTodo])
        });
      }

      await TodoService.createTodo(newTodo);
      await loadTodos(false);
    } catch (error) {
      console.error("Failed to create todo:", error);
      alert("Failed to create todo. Please try again.");
      await loadTodos(false);
    }
  }, [todoData, loadTodos]);

  const updateTodo = useCallback(async (updatedTodo: Todo) => {
    try {
      if (todoData) {
        const originalTodo = todoData.todos.find(t => t.id === updatedTodo.id);
        const wasCompleted = originalTodo?.completed || false;
        const isNowCompleted = updatedTodo.completed;
        const completedDelta = isNowCompleted && !wasCompleted ? 1 : !isNowCompleted && wasCompleted ? -1 : 0;

        setTodoData({
          ...todoData,
          todos: todoData.todos.map(todo =>
            todo.id === updatedTodo.id ? updatedTodo : todo
          ),
          metadata: {
            ...todoData.metadata,
            completedTodos: todoData.metadata.completedTodos + completedDelta,
            lastUpdated: new Date().toISOString()
          }
        });
      }

      await TodoService.updateTodo(updatedTodo);
      await loadTodos(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
      alert("Failed to update todo. Please try again.");
      await loadTodos(false);
    }
  }, [todoData, loadTodos]);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      const originalTodo = todoData?.todos.find(t => t.id === id);

      if (todoData && originalTodo) {
        setTodoData({
          ...todoData,
          todos: todoData.todos.filter(todo => todo.id !== id),
          metadata: updateTodoMetadata(todoData.todos.filter(todo => todo.id !== id))
        });
      }

      await TodoService.deleteTodo(id);
      await loadTodos(false);
    } catch (error) {
      console.error("Failed to delete todo:", error);
      alert("Failed to delete todo. Please try again.");
      await loadTodos(false);
    }
  }, [todoData, loadTodos]);

  const toggleTodo = useCallback(async (id: string) => {
    if (!todoData) return;

    const todo = todoData.todos.find(t => t.id === id);
    if (todo) {
      const updatedTodo = {
        ...todo,
        completed: !todo.completed,
        updatedAt: new Date().toISOString()
      };

      setTodoData({
        ...todoData,
        todos: todoData.todos.map(t =>
          t.id === id ? updatedTodo : t
        ),
        metadata: {
          ...todoData.metadata,
          completedTodos: todoData.metadata.completedTodos + (updatedTodo.completed ? 1 : -1),
          lastUpdated: new Date().toISOString()
        }
      });

      try {
        await TodoService.updateTodo(updatedTodo);
        await loadTodos(false);
      } catch (error) {
        console.error("Failed to toggle todo:", error);
        await loadTodos(false);
      }
    }
  }, [todoData, loadTodos]);

  const filteredTodos = todoData?.todos.filter(todo => {
    const statusMatch = filter === "all" ||
      (filter === "completed" && todo.completed) ||
      (filter === "pending" && !todo.completed);

    const categoryMatch = categoryFilter === "all" || todo.category === categoryFilter;

    return statusMatch && categoryMatch;
  }) || [];

  return {
    todoData,
    isLoading,
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    filteredTodos,
    loadTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo
  };
};
