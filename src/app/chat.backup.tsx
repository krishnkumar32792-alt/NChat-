import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useChatStore } from '@/store/chat';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Array.isArray(id) ? id[0] : id || '1';

  const [text, setText] = useState('');
  const [replyId, setReplyId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const messages = useChatStore(
    (state) => state.messages[userId] || []
  );

  const savedMessages = useChatStore(
    (state) => state.savedMessages[userId] || []
  );

  const sendMessage = useChatStore((state) => state.sendMessage);
  const editMessage = useChatStore((state) => state.editMessage);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const setReaction = useChatStore((state) => state.setReaction);
  const toggleSaveMessage = useChatStore(
    (state) => state.toggleSaveMessage
  );
  const markMessageSeen = useChatStore(
    (state) => state.markMessageSeen
  );
  const loadMessages = useChatStore((state) => state.loadMessages);

  useEffect(() => {
    loadMessages(userId);
  }, [userId, loadMessages]);

  function submitMessage() {
    const value = text.trim();
    if (!value) return;

    if (editId) {
      editMessage(userId, editId, value);
      setEditId(null);
    } else {
      const replyMessage = replyId
        ? messages.find((message) => message.id === replyId)
        : undefined;

      sendMessage(
        userId,
        value,
        replyMessage
          ? {
              id: replyMessage.id,
              text: replyMessage.text,
            }
          : undefined
      );

      setReplyId(null);
    }

    setText('');
  }

  function startEdit(messageId: string, messageText: string) {
    setEditId(messageId);
    setReplyId(null);
    setText(messageText);
  }

  function startReply(messageId: string) {
    setReplyId(messageId);
    setEditId(null);
    setText('');
  }

  const chatName =
    userId === '1'
      ? 'alex'
      : userId === '2'
        ? 'rahul'
        : userId === '3'
          ? 'riya'
          : 'Chat';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <View>
          <Text style={styles.title}>{chatName}</Text>
          <Text style={styles.subtitle}>Online</Text>
        </View>
      </View>

      {(replyId || editId) && (
        <View style={styles.actionBar}>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>
              {editId ? 'Editing message' : 'Replying'}
            </Text>

            <Text numberOfLines={1} style={styles.actionText}>
              {editId
                ? messages.find((m) => m.id === editId)?.text
                : messages.find((m) => m.id === replyId)?.text}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              setReplyId(null);
              setEditId(null);
              setText('');
            }}
          >
            <Text style={styles.cancel}>✕</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isMe = item.sender === 'me';
          const isSaved = savedMessages.includes(item.id);

          return (
            <Pressable
              onPress={() => markMessageSeen(userId, item.id)}
              onLongPress={() => {
                if (isMe) {
                  startEdit(item.id, item.text);
                }
              }}
              style={[
                styles.messageWrapper,
                isMe
                  ? styles.myWrapper
                  : styles.otherWrapper,
              ]}
            >
              {item.replyTo && (
                <View style={styles.replyPreview}>
                  <Text style={styles.replyLabel}>↩ Reply</Text>
                  <Text
                    numberOfLines={1}
                    style={styles.replyText}
                  >
                    {item.replyTo.text}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.message,
                  isMe ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    !isMe && styles.otherMessageText,
                  ]}
                >
                  {item.text}
                </Text>

                <View style={styles.meta}>
                  {item.edited && (
                    <Text
                      style={[
                        styles.metaText,
                        !isMe && styles.otherMetaText,
                      ]}
                    >
                      edited
                    </Text>
                  )}

                  <Text
                    style={[
                      styles.metaText,
                      !isMe && styles.otherMetaText,
                    ]}
                  >
                    {item.time}
                  </Text>

                  {isMe && (
                    <Text style={styles.seen}>
                      {item.seen ? '✓✓' : '✓'}
                    </Text>
                  )}
                </View>
              </View>

              {item.reaction && (
                <View style={styles.reaction}>
                  <Text>{item.reaction}</Text>
                </View>
              )}

              <View style={styles.tools}>
                <Pressable
                  onPress={() => startReply(item.id)}
                  style={styles.toolButton}
                >
                  <Text>↩</Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    setReaction(userId, item.id, '❤️')
                  }
                  style={styles.toolButton}
                >
                  <Text>❤️</Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    toggleSaveMessage(userId, item.id)
                  }
                  style={styles.toolButton}
                >
                  <Text>{isSaved ? '🔖' : '🔖'}</Text>
                </Pressable>

                {isMe && (
                  <>
                    <Pressable
                      onPress={() =>
                        startEdit(item.id, item.text)
                      }
                      style={styles.toolButton}
                    >
                      <Text>✏️</Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        deleteMessage(userId, item.id)
                      }
                      style={styles.toolButton}
                    >
                      <Text>🗑️</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>Start a conversation 👋</Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={
            editId ? 'Edit message...' : 'Message...'
          }
          style={styles.input}
          multiline
        />

        <Pressable style={styles.send} onPress={submitMessage}>
          <Text style={styles.sendText}>
            {editId ? 'Save' : 'Send'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  back: {
    fontSize: 35,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
  },
  subtitle: {
    color: '#777',
    marginTop: 2,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f2f2f2',
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontWeight: '700',
    fontSize: 13,
  },
  actionText: {
    color: '#666',
    marginTop: 2,
  },
  cancel: {
    fontSize: 20,
    padding: 8,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
  },
  messageWrapper: {
    marginBottom: 14,
    maxWidth: '85%',
  },
  myWrapper: {
    alignSelf: 'flex-end',
  },
  otherWrapper: {
    alignSelf: 'flex-start',
  },
  message: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: '#208AEF',
  },
  otherMessage: {
    backgroundColor: '#eee',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  otherMessageText: {
    color: '#111',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  metaText: {
    color: '#d9ecff',
    fontSize: 10,
  },
  otherMetaText: {
    color: '#777',
  },
  seen: {
    color: '#bfe2ff',
    fontSize: 12,
  },
  replyPreview: {
    backgroundColor: '#e8e8e8',
    padding: 7,
    borderRadius: 10,
    marginBottom: 3,
  },
  replyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#208AEF',
  },
  replyText: {
    fontSize: 12,
    color: '#555',
  },
  reaction: {
    position: 'absolute',
    bottom: -8,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 2,
    elevation: 2,
  },
  tools: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 3,
  },
  toolButton: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  send: {
    backgroundColor: '#208AEF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
  },
});


