import { ChatMessage } from '@/types';

export interface AIChatResponse {
  message: string;
  functionCalled?: string;
  functionResult?: any;
}

export class AIChatService {
  static async sendMessage(message: string, history: ChatMessage[]): Promise<AIChatResponse> {
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }
}
