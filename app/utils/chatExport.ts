import type { Message } from 'ai';
import { toast } from 'react-toastify';

export interface ChatExportData {
  messages: Message[];
  description?: string;
  exportDate: string;
}

export const exportChat = (messages: Message[], description?: string) => {
  const chatData: ChatExportData = {
    messages,
    description,
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importChat = async (file: File): Promise<ChatExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (!Array.isArray(data.messages)) {
          throw new Error('Invalid chat file format');
        }
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse chat file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read chat file'));
    reader.readAsText(file);
  });
};
