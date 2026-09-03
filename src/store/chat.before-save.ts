import { create } from 'zustand';

export type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
};

type ChatState = {
  messages: Record<string, Message[]>;
  unread: Record<string, number>;
  sendMessage: (userId: string, text: string) => void;
  receiveMessage: (userId: string, text: string) => void;
  markRead: (userId: string) => void;
  getLastMessage: (userId: string) => Message | undefined;
  deleteMessage: (userId: string, messageId: string) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {
    '1': [],
    '2': [],
    '3': [],
  },

  unread: {
    '1': 0,
    '2': 0,
    '3': 0,
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

  receiveMessage: (userId, text) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: [
          ...(state.messages[userId] || []),
          {
            id: Date.now().toString(),
            text,
            sender: 'other',
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ],
      },
      unread: {
        ...state.unread,
        [userId]: (state.unread[userId] || 0) + 1,
      },
    })),

  markRead: (userId) =>
    set((state) => ({
      unread: {
        ...state.unread,
        [userId]: 0,
      },
    })),

  getLastMessage: (userId) => {
    const list = get().messages[userId] || [];
    return list[list.length - 1];
  },

  deleteMessage: (userId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: (state.messages[userId] || []).filter(
          (message) => message.id !== messageId
        ),
      },
    })),
}));
