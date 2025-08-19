import { prisma } from '@/lib/prisma';
import { Todo, Category, TodoData } from '@/types';
import { Priority } from '@prisma/client';

export class DatabaseService {
  static async getAllTodos(): Promise<TodoData> {
    const [todos, categories] = await Promise.all([
      prisma.todo.findMany({
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.category.findMany({
        orderBy: {
          name: 'asc'
        }
      })
    ]);

    const formattedTodos: Todo[] = todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      priority: todo.priority.toLowerCase() as "high" | "medium" | "low",
      category: todo.categoryId,
      dueDate: todo.dueDate.toISOString().split('T')[0],
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    }));

    const formattedCategories: Category[] = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color
    }));

    const completedTodos = formattedTodos.filter(t => t.completed).length;

    return {
      todos: formattedTodos,
      categories: formattedCategories,
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalTodos: formattedTodos.length,
        completedTodos,
        version: "2.0.0"
      }
    };
  }

  static async createTodo(todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">): Promise<Todo> {
    const priority = todoData.priority.toUpperCase() as Priority;

    const todo = await prisma.todo.create({
      data: {
        title: todoData.title,
        description: todoData.description,
        completed: todoData.completed,
        priority,
        dueDate: new Date(todoData.dueDate),
        categoryId: todoData.category
      },
      include: {
        category: true
      }
    });

    return {
      id: todo.id,
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      priority: todo.priority.toLowerCase() as "high" | "medium" | "low",
      category: todo.categoryId,
      dueDate: todo.dueDate.toISOString().split('T')[0],
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    };
  }

  static async updateTodo(todoData: Todo): Promise<Todo> {
    const priority = todoData.priority.toUpperCase() as Priority;

    const todo = await prisma.todo.update({
      where: { id: todoData.id },
      data: {
        title: todoData.title,
        description: todoData.description,
        completed: todoData.completed,
        priority,
        dueDate: new Date(todoData.dueDate),
        categoryId: todoData.category
      },
      include: {
        category: true
      }
    });

    return {
      id: todo.id,
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      priority: todo.priority.toLowerCase() as "high" | "medium" | "low",
      category: todo.categoryId,
      dueDate: todo.dueDate.toISOString().split('T')[0],
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    };
  }

  static async deleteTodo(id: string): Promise<void> {
    await prisma.todo.delete({
      where: { id }
    });
  }

  static async findTodosByTitle(title: string): Promise<Todo[]> {
    // First try exact match
    let todos = await prisma.todo.findMany({
      where: {
        title: {
          equals: title
        }
      },
      include: {
        category: true
      }
    });

    // If no exact match, try partial match with contains
    if (todos.length === 0) {
      todos = await prisma.todo.findMany({
        where: {
          title: {
            contains: title
          }
        },
        include: {
          category: true
        }
      });
    }

    // If still no match, try searching for individual words
    if (todos.length === 0) {
      const words = title.toLowerCase().split(' ');
      todos = await prisma.todo.findMany({
        where: {
          OR: words.map(word => ({
            title: {
              contains: word
            }
          }))
        },
        include: {
          category: true
        }
      });
    }

    return todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      priority: todo.priority.toLowerCase() as "high" | "medium" | "low",
      category: todo.categoryId,
      dueDate: todo.dueDate.toISOString().split('T')[0],
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    }));
  }

  static async findTodosByDescription(description: string): Promise<Todo[]> {
    // First try exact match in description
    let todos = await prisma.todo.findMany({
      where: {
        description: {
          contains: description
        }
      },
      include: {
        category: true
      }
    });

    // If no match in description, try searching in title as well
    if (todos.length === 0) {
      const words = description.toLowerCase().split(' ');
      todos = await prisma.todo.findMany({
        where: {
          OR: [
            ...words.map(word => ({
              title: {
                contains: word
              }
            })),
            ...words.map(word => ({
              description: {
                contains: word
              }
            }))
          ]
        },
        include: {
          category: true
        }
      });
    }

    return todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      priority: todo.priority.toLowerCase() as "high" | "medium" | "low",
      category: todo.categoryId,
      dueDate: todo.dueDate.toISOString().split('T')[0],
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    }));
  }

  static async smartSearch(query: string): Promise<Todo[]> {
    const words = query.toLowerCase().split(' ').filter(word => word.length > 0);

    // Search across title, description, and category
    const todos = await prisma.todo.findMany({
      where: {
        OR: [
          // Exact phrase match in title
          {
            title: {
              contains: query
            }
          },
          // Exact phrase match in description
          {
            description: {
              contains: query
            }
          },
          // Individual word matches in title
          ...words.map(word => ({
            title: {
              contains: word
            }
          })),
          // Individual word matches in description
          ...words.map(word => ({
            description: {
              contains: word
            }
          })),
          // Category name match
          {
            category: {
              name: {
                contains: query
              }
            }
          }
        ]
      },
      include: {
        category: true
      },
      orderBy: [
        // Prioritize exact matches in title
        {
          title: 'asc'
        }
      ]
    });

    return todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      priority: todo.priority.toLowerCase() as "high" | "medium" | "low",
      category: todo.categoryId,
      dueDate: todo.dueDate.toISOString().split('T')[0],
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    }));
  }

  static async initializeDefaultCategories(): Promise<void> {
    const existingCategories = await prisma.category.findMany();

    if (existingCategories.length === 0) {
      const defaultCategories = [
        { id: "work", name: "Work", color: "#3B82F6" },
        { id: "personal", name: "Personal", color: "#10B981" },
        { id: "health", name: "Health", color: "#EF4444" },
        { id: "learning", name: "Learning", color: "#8B5CF6" }
      ];

      await prisma.category.createMany({
        data: defaultCategories
      });
    }
  }
}
