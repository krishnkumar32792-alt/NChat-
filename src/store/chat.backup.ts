import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

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

type DbMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  reply_to_id: string | null;
  reaction: string | null;
  edited: boolean;
  seen: boolean;
  saved: boolean;
  created_at: string;
};

const channels: Record<string, ReturnType<typeof supabase.channel>> = {};

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

const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const mapMessage = (
  row: DbMessage,
  currentUserId: string
): Message => ({
  id: row.id,
  text: row.text,
  sender: row.sender_id === currentUserId ? 'me' : 'other',
  time: formatTime(row.created_at),
  ...(row.reply_to_id
    ? {
        replyTo: {
          id: row.reply_to_id,
          text: '',
        },
      }
    : {}),
  ...(row.reaction ? { reaction: row.reaction } : {}),
  ...(row.edited ? { edited: true } : {}),
  ...(row.seen ? { seen: true } : {}),
});

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  savedMessages: {},
  unread: {},
  typing: {},

  sendMessage: (userId, text, replyTo) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: userId,
          text: cleanText,
          reply_to_id: replyTo?.id ?? null,
        })
        .select()
        .single();

      if (error || !data) {
        console.log('SEND_MESSAGE_ERROR:', error?.message);
        return;
      }

      const message = mapMessage(data as DbMessage, user.id);

      set((state) => {
        const existing = state.messages[userId] || [];

        if (existing.some((item) => item.id === message.id)) {
          return state;
        }

        const messages = {
          ...state.messages,
          [userId]: [...existing, message],
        };

        persistChat(messages);
        return { messages };
      });
    })();
  },

  receiveMessage: (userId, text) => {
    const message: Message = {
      id: `local-${Date.now()}`,
      text,
      sender: 'other',
      time: formatTime(new Date()),
    };

    set((state) => {
      const messages = {
        ...state.messages,
        [userId]: [...(state.messages[userId] || []), message],
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

  deleteMessage: (userId, messageId) => {
    set((state) => {
      const messages = {
        ...state.messages,
        [userId]: (state.messages[userId] || []).filter(
          (message) => message.id !== messageId
        ),
      };

      persistChat(messages);
      return { messages };
    });

    void (async () => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.log('DELETE_MESSAGE_ERROR:', error.message);
      }
    })();
  },

  editMessage: (userId, messageId, text) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    set((state) => {
      const messages = {
        ...state.messages,
        [userId]: (state.messages[userId] || []).map((message) =>
          message.id === messageId
            ? {
                ...message,
                text: cleanText,
                edited: true,
              }
            : message
        ),
      };

      persistChat(messages);
      return { messages };
    });

    void (async () => {
      const { error } = await supabase
        .from('messages')
        .update({
          text: cleanText,
          edited: true,
        })
        .eq('id', messageId);

      if (error) {
        console.log('EDIT_MESSAGE_ERROR:', error.message);
      }
    })();
  },

  markMessageSeen: (userId, messageId) => {
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
    });

    void (async () => {
      const { error } = await supabase
        .from('messages')
        .update({ seen: true })
        .eq('id', messageId);

      if (error) {
        console.log('SEEN_MESSAGE_ERROR:', error.message);
      }
    })();
  },

  setTyping: (userId, typing) =>
    set((state) => ({
      typing: {
        ...state.typing,
        [userId]: typing,
      },
    })),

  toggleSaveMessage: (userId, messageId) => {
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
    });

    void (async () => {
      const saved = get().savedMessages[userId] || [];
      const isSaved = saved.includes(messageId);

      const { error } = await supabase
        .from('messages')
        .update({ saved: isSaved })
        .eq('id', messageId);

      if (error) {
        console.log('SAVE_MESSAGE_ERROR:', error.message);
      }
    })();
  },

  setReaction: (userId, messageId, reaction) => {
    set((state) => {
      const messages = {
        ...state.messages,
        [userId]: (state.messages[userId] || []).map((message) =>
          message.id === messageId
            ? {
                ...message,
                reaction:
                  message.reaction === reaction
                    ? undefined
                    : reaction,
              }
            : message
        ),
      };

      persistChat(messages);
      return { messages };
    });

    void (async () => {
      const current = (get().messages[userId] || []).find(
        (message) => message.id === messageId
      );

      const { error } = await supabase
        .from('messages')
        .update({
          reaction: current?.reaction ?? null,
        })
        .eq('id', messageId);

      if (error) {
        console.log('REACTION_ERROR:', error.message);
      }
    })();
  },

  loadMessages: async (userId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) {
        console.log('LOAD_SUPABASE_MESSAGES_ERROR:', error.message);
        return;
      }

      const rows = (data || []) as DbMessage[];
      const loaded = rows.map((row) => mapMessage(row, user.id));

      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: loaded,
        },
      }));

      persistChat(get().messages);

      if (!channels[userId]) {
        channels[userId] = supabase
          .channel(`nchat-messages-${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `receiver_id=eq.${user.id}`,
            },
            (payload) => {
              const row = payload.new as DbMessage;

              if (row.sender_id !== userId) return;

              const message = mapMessage(row, user.id);

              set((state) => {
                const existing = state.messages[userId] || [];

                if (existing.some((item) => item.id === message.id)) {
                  return state;
                }

                const messages = {
                  ...state.messages,
                  [userId]: [...existing, message],
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
            }
          )
          .subscribe();
      }
    } catch (error) {
      console.log('LOAD_MESSAGES_ERROR:', error);
    }
  },
}));
