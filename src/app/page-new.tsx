"use client";

import { useState } from "react";
import { Todo, TodoFormData } from '@/types';
import { useTodos } from '@/hooks/useTodos';
import { useAIChat } from '@/hooks/useAIChat';
import { TodoItem } from '@/components/TodoItem';
import { TodoForm } from '@/components/TodoForm';
import { AIChat } from '@/components/AIChat';
import { AIChatModal } from '@/components/AIChatModal';

export default function Home() {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const {
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
  } = useTodos();

  const chatHook = useAIChat(() => loadTodos(false));

  const handleCreateTodo = async (formData: TodoFormData) => {
    await createTodo(formData);
    setShowCreateForm(false);
  };

  const handleUpdateTodo = async (formData: TodoFormData) => {
    if (editingTodo) {
      await updateTodo({
        ...editingTodo,
        ...formData,
        updatedAt: new Date().toISOString()
      });
      setEditingTodo(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Main Todo Content - Left Side */}
        <div className="flex-1 overflow-y-auto py-8 px-4 md:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Todo App</h1>
            <p className="text-gray-600">Manage your tasks efficiently</p>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">{todoData?.metadata.totalTodos || 0}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{todoData?.metadata.completedTodos || 0}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-orange-900">
                  {(todoData?.metadata.totalTodos || 0) - (todoData?.metadata.completedTodos || 0)}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Categories</p>
                <p className="text-2xl font-bold text-purple-900">{todoData?.categories.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Status Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Todos</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {todoData?.categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + Add Todo
              </button>
            </div>
          </div>

          {/* Todo List */}
          <div className="space-y-4 pb-8">
            {filteredTodos.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 text-lg">No todos found</p>
                <p className="text-gray-400 mt-2">Create your first todo to get started!</p>
              </div>
            ) : (
              filteredTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  categories={todoData?.categories || []}
                  onToggle={() => toggleTodo(todo.id)}
                  onEdit={() => setEditingTodo(todo)}
                  onDelete={() => deleteTodo(todo.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* AI Chat Panel - Right Side */}
        <div className="hidden md:block w-96 border-l border-gray-200 bg-white shadow-lg">
          <AIChat
            messages={chatHook.messages}
            inputMessage={chatHook.inputMessage}
            setInputMessage={chatHook.setInputMessage}
            isLoading={chatHook.isLoading}
            sendMessage={chatHook.sendMessage}
            handleKeyPress={chatHook.handleKeyPress}
          />
        </div>

        {/* Mobile Chat Button (only visible on small screens) */}
        <button
          onClick={() => setShowAIChat(true)}
          className="md:hidden fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-colors z-50"
          title="Open AI Assistant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        {/* Mobile Chat Modal (only shown when clicked on mobile) */}
        <AIChatModal
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
          messages={chatHook.messages}
          inputMessage={chatHook.inputMessage}
          setInputMessage={chatHook.setInputMessage}
          isLoading={chatHook.isLoading}
          sendMessage={chatHook.sendMessage}
          handleKeyPress={chatHook.handleKeyPress}
        />

        {/* Create Todo Modal */}
        {showCreateForm && (
          <TodoForm
            categories={todoData?.categories || []}
            onSubmit={handleCreateTodo}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Edit Todo Modal */}
        {editingTodo && (
          <TodoForm
            todo={editingTodo}
            categories={todoData?.categories || []}
            onSubmit={handleUpdateTodo}
            onCancel={() => setEditingTodo(null)}
          />
        )}
      </div>
    </div>
  );
}
