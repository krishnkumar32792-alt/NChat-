import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
  replyTo?: {
    id: string;
    text: string;
  };
  reaction?: string;
  edited?: boolean;
  seen?: boolean;
};

type ChatState = {
  messages: Record<string, Message[]>;
  savedMessages: Record<string, string[]>;
  unread: Record<string, number>;
  typing: Record<string, boolean>;
  sendMessage: (
    userId: string,
    text: string,
    replyTo?: { id: string; text: string }
  ) => void;
  receiveMessage: (userId: string, text: string) => void;
  markRead: (userId: string) => void;
  getLastMessage: (userId: string) => Message | undefined;
  deleteMessage: (userId: string, messageId: string) => void;
  editMessage: (userId: string, messageId: string, text: string) => void;
  markMessageSeen: (userId: string, messageId: string) => void;
  setTyping: (userId: string, typing: boolean) => void;
  toggleSaveMessage: (userId: string, messageId: string) => void;
  setReaction: (userId: string, messageId: string, reaction: string) => void;
  loadMessages: (userId: string) => Promise<void>;
};

const persistChat = async (messages: Record<string, Message[]>) => {
  try {
    await AsyncStorage.setItem('nchat_messages', JSON.stringify(messages));
  } catch (error) {
    console.log('PERSIST_MESSAGES_ERROR:', error);
  }
};

const persistSaved = async (savedMessages: Record<string, string[]>) => {
  try {
    await AsyncStorage.setItem('nchat_saved', JSON.stringify(savedMessages));
  } catch (error) {
    console.log('PERSIST_SAVED_ERROR:', error);
  }
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

  savedMessages: {
    '1': [],
    '2': [],
    '3': [],
  },

  typing: {
    '1': false,
    '2': false,
    '3': false,
  },

  sendMessage: (userId, text, replyTo) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ...(replyTo ? { replyTo } : {}),
    };

    set((state) => {
      const messages = {
        ...state.messages,
        [userId]: [...(state.messages[userId] || []), message],
      };

      AsyncStorage.setItem('nchat_messages', JSON.stringify(messages));

      return { messages };
    });
  },

  receiveMessage: (userId, text) => {
    set((state) => {
      const messages = {
        ...state.messages,
        [userId]: [
          ...(state.messages[userId] || []),
          {
            id: Date.now().toString(),
            text,
            sender: 'other' as const,
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ],
      };

      persistChat(messages);

      return {
        messages,
        unread: {
          ...state.unread,
          [userId]: (state.unread[userId] || 0) + 1,
        },
      };
    });
  },

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
    set((state) => {
      const messages = {
        ...state.messages,
        [userId]: (state.messages[userId] || []).filter(
          (message) => message.id !== messageId
        ),
      };

      persistChat(messages);
      return { messages };
    }),

  loadMessages: async (userId) => {
    try {
      const saved = await AsyncStorage.getItem('nchat_messages');

      if (!saved) return;

      const messages = JSON.parse(saved);

      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: messages[userId] || [],
        },
      }));
    } catch (error) {
      console.log('LOAD_MESSAGES_ERROR:', error);
    }
  },

  setReaction: (userId, messageId, reaction) =>
    set((state) => {
      const messages = {
        ...state.messages,
        [userId]: (state.messages[userId] || []).map((message) =>
          message.id === messageId
            ? {
                ...message,
                reaction:
                  message.reaction === reaction ? undefined : reaction,
              }
            : message
        ),
      };

      persistChat(messages);
      return { messages };
    }),

  editMessage: (userId, messageId, text) =>
    set((state) => {
      const messages = {
        ...state.messages,
        [userId]: (state.messages[userId] || []).map((message) =>
          message.id === messageId
            ? {
                ...message,
                text,
                edited: true,
              }
            : message
        ),
      };

      persistChat(messages);
      return { messages };
    }),

  markMessageSeen: (userId, messageId) =>
    set((state) => {
      const messages = {
        ...state.messages,
        [userId]: (state.messages[userId] || []).map((message) =>
          message.id === messageId
            ? { ...message, seen: true }
            : message
        ),
      };

      persistChat(messages);
      return { messages };
    }),

  setTyping: (userId, typing) =>
    set((state) => ({
      typing: {
        ...state.typing,
        [userId]: typing,
      },
    })),

  toggleSaveMessage: (userId, messageId) =>
    set((state) => {
      const saved = state.savedMessages[userId] || [];
      const exists = saved.includes(messageId);

      const savedMessages = {
        ...state.savedMessages,
        [userId]: exists
          ? saved.filter((id) => id !== messageId)
          : [...saved, messageId],
      };

      persistSaved(savedMessages);
      return { savedMessages };
    }),
}));
