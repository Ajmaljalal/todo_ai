import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DatabaseService } from '@/services/databaseService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
});

const systemPrompt = `You are a helpful AI assistant that manages todos. You are DECISIVE and ACTION-ORIENTED. When a user asks you to do something, DO IT IMMEDIATELY without asking for confirmation.

CRITICAL RULE: You must ALWAYS call the appropriate action function (create, update, delete, toggle) - NEVER just search and stop!

CORE BEHAVIOR:
- Execute actions immediately when requested
- Only ask for clarification if you find MULTIPLE matches or if the request is genuinely ambiguous
- Don't ask for permission - just do what the user asked
- Be concise in your responses
- Always perform the action first, then give a brief confirmation

SEARCH AND ACTION STRATEGY:
- When user asks to change/update: Use update_todo_by_title (which includes smart search)
- When user asks to delete: Use delete_todo_by_title (which includes smart search)  
- When user asks to mark complete/toggle: Use toggle_todo_by_title (which includes smart search)
- DON'T use smart_search_todos alone unless user just wants to "find" or "show" todos
- ALWAYS follow search with the appropriate action

EXAMPLES OF CORRECT BEHAVIOR:
User: "Change truck to home" → Call update_todo_by_title with title="truck", newTitle="Buy Home"
User: "Delete the TypeScript todo" → Call delete_todo_by_title with title="TypeScript"
User: "Mark dentist as complete" → Call toggle_todo_by_title with title="dentist"
User: "Change hiking to soccer" → Call update_todo_by_title with title="hiking", newTitle="Plan weekend soccer game"

WRONG BEHAVIOR (DON'T DO THIS):
User: "Change truck to home" → Call smart_search_todos and then say "I found it and updated it" (YOU DIDN'T ACTUALLY UPDATE IT!)

Available functions:
- get_all_todos: Get all todos from the database
- create_todo: Create a new todo item
- update_todo: Update an existing todo by ID
- delete_todo: Delete a todo by ID
- toggle_todo_completion: Toggle the completion status of a todo
- find_todos_by_title: Find todos by searching their titles (use only for exact titles)
- find_todos_by_description: Find todos by searching their descriptions
- smart_search_todos: ONLY for finding/showing todos, NOT for actions
- delete_todo_by_title: Delete a todo by its title (includes smart search)
- update_todo_by_title: Update a todo by its title (includes smart search)
- toggle_todo_by_title: Toggle completion status by title (includes smart search)`;

const functions = [
  {
    name: "get_all_todos",
    description: "Get all todos from the database",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "create_todo",
    description: "Create a new todo item",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "The title of the todo" },
        description: { type: "string", description: "A detailed description of the todo" },
        priority: { type: "string", enum: ["high", "medium", "low"] },
        category: { type: "string", enum: ["work", "personal", "health", "learning"] },
        dueDate: { type: "string", description: "The due date in YYYY-MM-DD format" },
        completed: { type: "boolean", description: "Whether the todo is initially completed (defaults to false)" }
      },
      required: ["title"]
    }
  },
  {
    name: "update_todo",
    description: "Update an existing todo by ID",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "The ID of the todo to update" },
        title: { type: "string", description: "The title of the todo" },
        description: { type: "string", description: "A detailed description of the todo" },
        priority: { type: "string", enum: ["high", "medium", "low"] },
        category: { type: "string", enum: ["work", "personal", "health", "learning"] },
        dueDate: { type: "string", description: "The due date in YYYY-MM-DD format" },
        completed: { type: "boolean", description: "Whether the todo is completed" }
      },
      required: ["id"]
    }
  },
  {
    name: "delete_todo",
    description: "Delete a todo by ID",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "The ID of the todo to delete" }
      },
      required: ["id"]
    }
  },
  {
    name: "toggle_todo_completion",
    description: "Toggle the completion status of a todo",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "The ID of the todo to toggle" }
      },
      required: ["id"]
    }
  },
  {
    name: "find_todos_by_title",
    description: "Find todos by searching their titles",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "The title to search for" }
      },
      required: ["title"]
    }
  },
  {
    name: "find_todos_by_description",
    description: "Find todos by searching their descriptions",
    parameters: {
      type: "object",
      properties: {
        description: { type: "string", description: "The description text to search for" }
      },
      required: ["description"]
    }
  },
  {
    name: "smart_search_todos",
    description: "ONLY for finding/showing todos to the user. DO NOT use this for actions like update/delete/toggle - use the specific action functions instead",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query - can be keywords, phrases, or partial matches" }
      },
      required: ["query"]
    }
  },
  {
    name: "delete_todo_by_title",
    description: "Delete a todo by searching for it with keywords/partial title. Use this when user wants to delete a todo.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Keywords or partial title to search for the todo to delete" }
      },
      required: ["title"]
    }
  },
  {
    name: "update_todo_by_title",
    description: "Update a todo by searching for it with keywords/partial title. Use this when user wants to change/update a todo.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Keywords or partial title to search for the todo to update" },
        newTitle: { type: "string", description: "The new title" },
        description: { type: "string", description: "The new description" },
        priority: { type: "string", enum: ["high", "medium", "low"] },
        category: { type: "string", enum: ["work", "personal", "health", "learning"] },
        dueDate: { type: "string", description: "The due date in YYYY-MM-DD format" },
        completed: { type: "boolean", description: "Whether the todo is completed" }
      },
      required: ["title"]
    }
  },
  {
    name: "toggle_todo_by_title",
    description: "Toggle completion status of a todo by searching for it with keywords/partial title. Use this when user wants to mark complete/incomplete.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Keywords or partial title to search for the todo to toggle" }
      },
      required: ["title"]
    }
  }
];

async function handleFunctionCall(functionName: string, args: any) {
  try {
    switch (functionName) {
      case "get_all_todos":
        const allTodos = await DatabaseService.getAllTodos();
        return {
          success: true,
          todos: allTodos.todos,
          message: `Found ${allTodos.todos.length} todos`
        };

      case "create_todo":
        const newTodo = await DatabaseService.createTodo({
          title: args.title,
          description: args.description || `Task: ${args.title}`,
          completed: args.completed || false,
          priority: args.priority || "medium",
          category: args.category || "personal",
          dueDate: args.dueDate || new Date().toISOString().split('T')[0]
        });
        return {
          success: true,
          todo: newTodo,
          message: `Successfully created todo: "${newTodo.title}"`
        };

      case "update_todo":
        const todoData = await DatabaseService.getAllTodos();
        const todoToUpdate = todoData.todos.find(t => t.id === args.id);
        if (!todoToUpdate) {
          return { success: false, message: `Todo with ID ${args.id} not found` };
        }

        const updatedTodo = await DatabaseService.updateTodo({
          ...todoToUpdate,
          ...args,
          updatedAt: new Date().toISOString()
        });
        return {
          success: true,
          todo: updatedTodo,
          message: `Successfully updated todo: "${updatedTodo.title}"`
        };

      case "delete_todo":
        await DatabaseService.deleteTodo(args.id);
        return {
          success: true,
          message: `Successfully deleted todo with ID: ${args.id}`
        };

      case "toggle_todo_completion":
        const allTodosForToggle = await DatabaseService.getAllTodos();
        const todoToToggle = allTodosForToggle.todos.find(t => t.id === args.id);
        if (!todoToToggle) {
          return { success: false, message: `Todo with ID ${args.id} not found` };
        }

        const toggledTodo = await DatabaseService.updateTodo({
          ...todoToToggle,
          completed: !todoToToggle.completed,
          updatedAt: new Date().toISOString()
        });

        return {
          success: true,
          todo: toggledTodo,
          message: `Successfully ${toggledTodo.completed ? 'completed' : 'uncompleted'} todo: "${toggledTodo.title}"`
        };

      case "find_todos_by_title":
        const foundByTitle = await DatabaseService.findTodosByTitle(args.title);
        return {
          success: true,
          todos: foundByTitle,
          message: `Found ${foundByTitle.length} todos matching title: "${args.title}"`
        };

      case "find_todos_by_description":
        const foundByDescription = await DatabaseService.findTodosByDescription(args.description);
        return {
          success: true,
          todos: foundByDescription,
          message: `Found ${foundByDescription.length} todos matching description: "${args.description}"`
        };

      case "smart_search_todos":
        const smartSearchResults = await DatabaseService.smartSearch(args.query);
        return {
          success: true,
          todos: smartSearchResults,
          message: `Found ${smartSearchResults.length} todos matching: "${args.query}"`
        };

      case "delete_todo_by_title":
        const todosToDelete = await DatabaseService.smartSearch(args.title);
        if (todosToDelete.length === 0) {
          return { success: false, message: `No todos found matching: "${args.title}"` };
        }
        if (todosToDelete.length > 1) {
          return {
            success: false,
            message: `Multiple todos found matching "${args.title}". Please be more specific:\n${todosToDelete.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`,
            todos: todosToDelete
          };
        }

        await DatabaseService.deleteTodo(todosToDelete[0].id);
        return {
          success: true,
          message: `Successfully deleted todo: "${todosToDelete[0].title}"`
        };

      case "update_todo_by_title":
        const todosToUpdate = await DatabaseService.smartSearch(args.title);
        if (todosToUpdate.length === 0) {
          return { success: false, message: `No todos found matching: "${args.title}"` };
        }
        if (todosToUpdate.length > 1) {
          return {
            success: false,
            message: `Multiple todos found matching "${args.title}". Please be more specific:\n${todosToUpdate.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`,
            todos: todosToUpdate
          };
        }

        const todoToUpdateByTitle = todosToUpdate[0];

        // Intelligently generate description if title is being changed
        let newDescription = args.description;
        if (args.newTitle && !args.description) {
          newDescription = `Task: ${args.newTitle}`;
        }

        const updatedByTitle = await DatabaseService.updateTodo({
          ...todoToUpdateByTitle,
          title: args.newTitle || todoToUpdateByTitle.title,
          description: newDescription !== undefined ? newDescription : todoToUpdateByTitle.description,
          priority: args.priority || todoToUpdateByTitle.priority,
          category: args.category || todoToUpdateByTitle.category,
          dueDate: args.dueDate || todoToUpdateByTitle.dueDate,
          completed: args.completed !== undefined ? args.completed : todoToUpdateByTitle.completed,
          updatedAt: new Date().toISOString()
        });

        return {
          success: true,
          todo: updatedByTitle,
          message: `Successfully updated todo: "${updatedByTitle.title}"`
        };

      case "toggle_todo_by_title":
        const todosToToggleByTitle = await DatabaseService.smartSearch(args.title);
        if (todosToToggleByTitle.length === 0) {
          return { success: false, message: `No todos found matching: "${args.title}"` };
        }
        if (todosToToggleByTitle.length > 1) {
          return {
            success: false,
            message: `Multiple todos found matching "${args.title}". Please be more specific:\n${todosToToggleByTitle.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`,
            todos: todosToToggleByTitle
          };
        }

        const todoToToggleByTitle = todosToToggleByTitle[0];
        const toggledByTitle = await DatabaseService.updateTodo({
          ...todoToToggleByTitle,
          completed: !todoToToggleByTitle.completed,
          updatedAt: new Date().toISOString()
        });

        return {
          success: true,
          todo: toggledByTitle,
          message: `Successfully ${toggledByTitle.completed ? 'completed' : 'uncompleted'} todo: "${toggledByTitle.title}"`
        };

      default:
        return { success: false, message: `Unknown function: ${functionName}` };
    }
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    return { success: false, message: `Error executing ${functionName}: ${error}` };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
      return NextResponse.json({
        message: "Please set your OpenAI API key in the environment variables."
      }, { status: 400 });
    }

    const conversationHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message }
      ],
      tools: functions.map(func => ({
        type: "function" as const,
        function: func
      })),
      tool_choice: "auto",
      temperature: 0.7,
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0];
      if (toolCall.type === 'function') {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const functionResult = await handleFunctionCall(functionName, functionArgs);

        const followUpCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: message },
            responseMessage,
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(functionResult)
            }
          ],
          temperature: 0.7,
        });

        const aiMessage = followUpCompletion.choices[0].message.content;
        const actionResult = functionResult.success ? `✅ ${functionResult.message}` : `❌ ${functionResult.message}`;
        const enhancedMessage = `${aiMessage}\n\n${actionResult}`;

        return NextResponse.json({
          message: enhancedMessage,
          functionCalled: functionName,
          functionResult: functionResult
        });
      }
    }

    return NextResponse.json({
      message: responseMessage.content || "I apologize, but I couldn't process your request. Please try again."
    });

  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({
      message: "Sorry, I encountered an error. Please try again."
    }, { status: 500 });
  }
}