import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  senderId: string;
  receiverId: string;
  createdAt: string;
  seen: boolean;
  edited: boolean;
  reaction: string | null;
  replyTo: {
    id: string;
    text: string;
  } | null;
  saved: boolean;
};

type DbMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
  seen: boolean;
  edited: boolean;
  reaction: string | null;
  reply_to_id: string | null;
  reply_to_text: string | null;
};

type ChatState = {
  messages: Record<string, Message[]>;
  unread: Record<string, number>;
  savedMessages: string[];
  typing: Record<string, boolean>;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  loadMessages: (userId: string) => Promise<void>;

  sendMessage: (
    userId: string,
    text: string,
    replyTo?: Message | null
  ) => Promise<void>;

  receiveMessage: (
    userId: string,
    text: string
  ) => void;

  deleteMessage: (
    userId: string,
    messageId: string
  ) => Promise<void>;

  editMessage: (
    userId: string,
    messageId: string,
    text: string
  ) => Promise<void>;

  markRead: (userId: string) => Promise<void>;

  markMessageSeen: (
    userId: string,
    messageId: string
  ) => Promise<void>;

  setReaction: (
    userId: string,
    messageId: string,
    reaction: string | null
  ) => Promise<void>;

  toggleSaveMessage: (
    userId: string,
    messageId: string
  ) => Promise<void>;

  setTyping: (
    userId: string,
    value: boolean
  ) => void;
};

const MESSAGES_KEY = '@nchat_messages';
const SAVED_KEY = '@nchat_saved_messages';

const conversationId = (a: string, b: string) =>
  [a, b].sort().join(':');

const createMessageId = () =>
  `msg-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

const saveMessages = async (
  messages: Record<string, Message[]>
) => {
  try {
    await AsyncStorage.setItem(
      MESSAGES_KEY,
      JSON.stringify(messages)
    );
  } catch (error) {
    console.log('CHAT_LOCAL_SAVE_ERROR:', error);
  }
};

const saveSavedMessages = async (
  savedMessages: string[]
) => {
  try {
    await AsyncStorage.setItem(
      SAVED_KEY,
      JSON.stringify(savedMessages)
    );
  } catch (error) {
    console.log('SAVED_MESSAGES_SAVE_ERROR:', error);
  }
};

const mapMessage = (
  row: DbMessage,
  currentUserId: string,
  savedMessages: string[]
): Message => ({
  id: row.id,
  text: row.text,
  sender:
    row.sender_id === currentUserId
      ? 'me'
      : 'them',
  senderId: row.sender_id,
  receiverId: row.receiver_id,
  createdAt: row.created_at,
  seen: Boolean(row.seen),
  edited: Boolean(row.edited),
  reaction: row.reaction ?? null,
  replyTo: row.reply_to_id
    ? {
        id: row.reply_to_id,
        text: row.reply_to_text ?? '',
      }
    : null,
  saved: savedMessages.includes(row.id),
});

let realtimeChannel:
  ReturnType<typeof supabase.channel> | null = null;

let realtimeUserId: string | null = null;

export const useChatStore = create<ChatState>((set, get) => {
  const persist = () => {
    void saveMessages(get().messages);
    void saveSavedMessages(get().savedMessages);
  };

  const setupRealtime = (currentUserId: string) => {
    if (
      realtimeChannel &&
      realtimeUserId === currentUserId
    ) {
      return;
    }

    if (realtimeChannel) {
      void supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

    realtimeUserId = currentUserId;

    realtimeChannel = supabase
      .channel(`nchat-messages-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const currentUser = realtimeUserId;

          if (!currentUser) return;

          if (payload.eventType === 'DELETE') {
            const oldRow =
              payload.old as Partial<DbMessage>;

            if (!oldRow.id) return;

            set((state) => {
              const next = { ...state.messages };

              Object.keys(next).forEach((chatUserId) => {
                next[chatUserId] = next[chatUserId].filter(
                  (message) => message.id !== oldRow.id
                );
              });

              return { messages: next };
            });

            persist();
            return;
          }

          const row =
            payload.new as Partial<DbMessage>;

          if (
            !row.id ||
            !row.sender_id ||
            !row.receiver_id ||
            !row.created_at
          ) {
            return;
          }

          const partnerId =
            row.sender_id === currentUser
              ? row.receiver_id
              : row.sender_id;

          const message = mapMessage(
            row as DbMessage,
            currentUser,
            get().savedMessages
          );

          set((state) => {
            const existing =
              state.messages[partnerId] ?? [];

            if (payload.eventType === 'INSERT') {
              if (row.sender_id === currentUser) {
                return state;
              }

              if (
                existing.some(
                  (item) => item.id === message.id
                )
              ) {
                return state;
              }

              return {
                messages: {
                  ...state.messages,
                  [partnerId]: [
                    ...existing,
                    message,
                  ],
                },
                unread: {
                  ...state.unread,
                  [partnerId]:
                    (state.unread[partnerId] ?? 0) + 1,
                },
              };
            }

            if (payload.eventType === 'UPDATE') {
              return {
                messages: {
                  ...state.messages,
                  [partnerId]: existing.map(
                    (item) =>
                      item.id === message.id
                        ? message
                        : item
                  ),
                },
              };
            }

            return state;
          });

          persist();
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.log(
            'CHAT_REALTIME_STATUS:',
            status
          );
        }
      });
  };

  return {
    messages: {},
    unread: {},
    savedMessages: [],
    typing: {},
    hydrated: false,

    hydrate: async () => {
      try {
        const [
          messagesRaw,
          savedRaw,
        ] = await Promise.all([
          AsyncStorage.getItem(MESSAGES_KEY),
          AsyncStorage.getItem(SAVED_KEY),
        ]);

        let messages: Record<string, Message[]> = {};
        let savedMessages: string[] = [];

        if (messagesRaw) {
          try {
            messages = JSON.parse(messagesRaw);
          } catch {
            messages = {};
          }
        }

        if (savedRaw) {
          try {
            const parsed = JSON.parse(savedRaw);

            if (Array.isArray(parsed)) {
              savedMessages = parsed;
            }
          } catch {
            savedMessages = [];
          }
        }

        set({
          messages,
          savedMessages,
          hydrated: true,
        });

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setupRealtime(user.id);
        }
      } catch (error) {
        console.log(
          'CHAT_HYDRATE_ERROR:',
          error
        );

        set({
          hydrated: true,
        });
      }
    },

    loadMessages: async (userId) => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        return;
      }

      setupRealtime(currentUser.id);

      const id = conversationId(
        currentUser.id,
        userId
      );

      let data: DbMessage[] | null = null;

      const result = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', {
          ascending: true,
        });

      if (result.error) {
        console.log(
          'LOAD_MESSAGES_ERROR:',
          result.error.message
        );
      } else {
        data = result.data as DbMessage[];
      }

      if (!data?.length) {
        const fallback =
          await supabase
            .from('messages')
            .select('*')
            .or(
              `and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`
            )
            .order('created_at', {
              ascending: true,
            });

        if (!fallback.error) {
          data = fallback.data as DbMessage[];
        }
      }

      if (!data) {
        return;
      }

      const mapped = data.map((row) =>
        mapMessage(
          row,
          currentUser.id,
          get().savedMessages
        )
      );

      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: mapped,
        },
      }));

      persist();
    },

    sendMessage: async (
      userId,
      text,
      replyTo = null
    ) => {
      const cleanText = text.trim();

      if (!cleanText) {
        return;
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        throw new Error('You are not logged in.');
      }

      const now = new Date().toISOString();

      const newId = createMessageId();

      const row = {
        id: newId,
        conversation_id: conversationId(
          currentUser.id,
          userId
        ),
        sender_id: currentUser.id,
        receiver_id: userId,
        text: cleanText,
        created_at: now,
        seen: false,
        edited: false,
        reaction: null,
        reply_to_id: replyTo?.id ?? null,
        reply_to_text: replyTo?.text ?? null,
      };

      const { data, error } =
        await supabase
          .from('messages')
          .insert(row)
          .select('*')
          .single();

      if (error || !data) {
        console.log(
          'SEND_MESSAGE_ERROR:',
          error?.message
        );

        throw error ?? new Error(
          'Message could not be sent.'
        );
      }

      const message = mapMessage(
        data as DbMessage,
        currentUser.id,
        get().savedMessages
      );

      set((state) => {
        const existing =
          state.messages[userId] ?? [];

        if (
          existing.some(
            (item) => item.id === message.id
          )
        ) {
          return state;
        }

        return {
          messages: {
            ...state.messages,
            [userId]: [
              ...existing,
              message,
            ],
          },
        };
      });

      persist();
    },

    receiveMessage: (userId, text) => {
      const cleanText = text.trim();

      if (!cleanText) return;

      const message: Message = {
        id: createMessageId(),
        text: cleanText,
        sender: 'them',
        senderId: userId,
        receiverId: 'me',
        createdAt: new Date().toISOString(),
        seen: false,
        edited: false,
        reaction: null,
        replyTo: null,
        saved: false,
      };

      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: [
            ...(state.messages[userId] ?? []),
            message,
          ],
        },
        unread: {
          ...state.unread,
          [userId]:
            (state.unread[userId] ?? 0) + 1,
        },
      }));

      persist();
    },

    deleteMessage: async (
      userId,
      messageId
    ) => {
      const message =
        get().messages[userId]?.find(
          (item) => item.id === messageId
        );

      if (!message) return;

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (
        currentUser &&
        message.senderId === currentUser.id
      ) {
        const { error } =
          await supabase
            .from('messages')
            .delete()
            .eq('id', messageId)
            .eq('sender_id', currentUser.id);

        if (error) {
          console.log(
            'DELETE_MESSAGE_ERROR:',
            error.message
          );
          throw error;
        }
      }

      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: (
            state.messages[userId] ?? []
          ).filter(
            (item) => item.id !== messageId
          ),
        },
      }));

      set((state) => ({
        savedMessages:
          state.savedMessages.filter(
            (id) => id !== messageId
          ),
      }));

      persist();
    },

    editMessage: async (
      userId,
      messageId,
      text
    ) => {
      const cleanText = text.trim();

      if (!cleanText) return;

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        throw new Error('You are not logged in.');
      }

      const message =
        get().messages[userId]?.find(
          (item) => item.id === messageId
        );

      if (
        !message ||
        message.senderId !== currentUser.id
      ) {
        return;
      }

      const { data, error } =
        await supabase
          .from('messages')
          .update({
            text: cleanText,
            edited: true,
          })
          .eq('id', messageId)
          .eq('sender_id', currentUser.id)
          .select('*')
          .single();

      if (error || !data) {
        console.log(
          'EDIT_MESSAGE_ERROR:',
          error?.message
        );

        throw error ?? new Error(
          'Message could not be edited.'
        );
      }

      const updated = mapMessage(
        data as DbMessage,
        currentUser.id,
        get().savedMessages
      );

      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: (
            state.messages[userId] ?? []
          ).map((item) =>
            item.id === messageId
              ? updated
              : item
          ),
        },
      }));

      persist();
    },

    markRead: async (userId) => {
      set((state) => ({
        unread: {
          ...state.unread,
          [userId]: 0,
        },
      }));

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        persist();
        return;
      }

      const { error } =
        await supabase
          .from('messages')
          .update({ seen: true })
          .eq('sender_id', userId)
          .eq('receiver_id', currentUser.id)
          .eq('seen', false);

      if (error) {
        console.log(
          'MARK_READ_ERROR:',
          error.message
        );
      }

      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: (
            state.messages[userId] ?? []
          ).map((item) =>
            item.sender === 'them'
              ? {
                  ...item,
                  seen: true,
                }
              : item
          ),
        },
      }));

      persist();
    },

    markMessageSeen: async (
      userId,
      messageId
    ) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: (
            state.messages[userId] ?? []
          ).map((item) =>
            item.id === messageId
              ? {
                  ...item,
                  seen: true,
                }
              : item
          ),
        },
      }));

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        persist();
        return;
      }

      const { error } =
        await supabase
          .from('messages')
          .update({ seen: true })
          .eq('id', messageId)
          .eq('receiver_id', currentUser.id);

      if (error) {
        console.log(
          'MARK_SEEN_ERROR:',
          error.message
        );
      }

      persist();
    },

    setReaction: async (
      userId,
      messageId,
      reaction
    ) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: (
            state.messages[userId] ?? []
          ).map((item) =>
            item.id === messageId
              ? {
                  ...item,
                  reaction,
                }
              : item
          ),
        },
      }));

      const { error } =
        await supabase
          .from('messages')
          .update({
            reaction,
          })
          .eq('id', messageId);

      if (error) {
        console.log(
          'REACTION_ERROR:',
          error.message
        );
      }

      persist();
    },

    toggleSaveMessage: async (
      userId,
      messageId
    ) => {
      const current =
        get().savedMessages.includes(messageId);

      set((state) => {
        const savedMessages = current
          ? state.savedMessages.filter(
              (id) => id !== messageId
            )
          : [
              ...state.savedMessages,
              messageId,
            ];

        return {
          savedMessages,
          messages: {
            ...state.messages,
            [userId]: (
              state.messages[userId] ?? []
            ).map((item) =>
              item.id === messageId
                ? {
                    ...item,
                    saved: !current,
                  }
                : item
            ),
          },
        };
      });

      persist();
    },

    setTyping: (userId, value) => {
      set((state) => ({
        typing: {
          ...state.typing,
          [userId]: value,
        },
      }));
    },
  };
});
