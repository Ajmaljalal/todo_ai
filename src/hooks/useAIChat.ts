import { useState, useCallback } from 'react';
import { ChatMessage } from '@/types';
import { AIChatService } from '@/services/aiChatService';

export const useAIChat = (onTodosUpdate: () => void) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m your AI assistant. I can help you manage your todos. You can ask me to create, update, delete, or show your todos. What would you like to do?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const data = await AIChatService.sendMessage(userMessage, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);

      // If the AI performed an action that modified todos, silently refresh the todo list
      const todoModifyingActions = [
        'create_todo', 'update_todo', 'delete_todo', 'toggle_todo_completion',
        'update_todo_by_title', 'delete_todo_by_title', 'toggle_todo_by_title'
      ];

      if (data.functionCalled && todoModifyingActions.includes(data.functionCalled)) {
        onTodosUpdate();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, messages, onTodosUpdate]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    sendMessage,
    handleKeyPress
  };
};
