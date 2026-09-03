import { create } from 'zustand';

export type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
};

type ChatState = {
  messages: Record<string, Message[]>;
  sendMessage: (userId: string, text: string) => void;
  getLastMessage: (userId: string) => Message | undefined;
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {
    '1': [],
    '2': [],
    '3': [],
  },

  sendMessage: (userId, text) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: [
          ...(state.messages[userId] || []),
          {
            id: Date.now().toString(),
            text,
            sender: 'me',
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ],
      },
    })),

  getLastMessage: (userId) => {
    const list = get().messages[userId] || [];
    return list[list.length - 1];
  },
}));
