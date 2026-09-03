import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/users';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const user = useUserStore((state) =>
    state.users.find((item) => item.id === id)
  );

  const messages = useChatStore(
    (state) => state.messages[id || ''] || []
  );

  const sendMessage = useChatStore((state) => state.sendMessage);
  const markRead = useChatStore((state) => state.markRead);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const savedMessages = useChatStore((state) => state.savedMessages);
  const toggleSaveMessage = useChatStore(
    (state) => state.toggleSaveMessage
  );

  const setReaction = useChatStore(
    (state) => state.setReaction
  );

  const editMessage = useChatStore(
    (state) => state.editMessage
  );
  const receiveMessage = useChatStore((state) => state.receiveMessage);

  useEffect(() => {
    if (id) markRead(id);
  }, [id, markRead]);

  const [text, setText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  function send() {
    const message = text.trim();

    if (!message || !id) return;

    const reply =
      replyingTo
        ? {
            id: replyingTo,
            text:
              (messages.find((m) => m.id === replyingTo)?.text) ||
              '',
          }
        : undefined;

    sendMessage(id, message, reply);
    setText('');
    setReplyingTo(null);
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>User not found</Text>
      </View>
    );
  }

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
          <Text style={styles.username}>{user.username}</Text>
          {text.trim() ? (
            <Text style={styles.typing}>● Typing...</Text>
          ) : (
            <Text style={styles.online}>● Online</Text>
          )}
        </View>

        <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() => {
              setSelectedMessage(item.id);
            }}
          >
            <View
              style={[
                styles.message,
                item.sender === 'me'
                  ? styles.myMessage
                  : styles.otherMessage,
              ]}
            >
            {item.replyTo && (
              <View style={styles.repliedMessage}>
                <Text style={styles.repliedTitle}>
                  ↩️ Reply
                </Text>
                <Text
                  style={[
                    styles.repliedText,
                    item.sender === 'me' && styles.repliedTextMine,
                  ]}
                  numberOfLines={2}
                >
                  {item.replyTo.text}
                </Text>
              </View>
            )}

            <Text
              style={[
                styles.messageText,
                item.sender === 'me' && styles.myMessageText,
              ]}
            >
              {item.text}
            </Text>

            {item.edited && (
              <Text
                style={[
                  styles.editedText,
                  item.sender === 'me' && styles.editedTextMine,
                ]}
              >
                Edited
              </Text>
            )}

            {item.reaction && (
              <View style={styles.reactionBubble}>
                <Text style={styles.reactionBubbleText}>
                  {item.reaction}
                </Text>
              </View>
            )}

            <Text
              style={[
                styles.time,
                item.sender === 'me' && styles.myTime,
              ]}
            >
              {item.time}
            </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              Start a conversation 👋
            </Text>
            <Text style={styles.emptyText}>
              Send your first message.
            </Text>
          </View>
        }
      />

      <Modal
        visible={selectedMessage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setSelectedMessage(null)}
        >
          <View style={styles.actionMenu}>
            {(() => {
              const isSaved = (savedMessages[id || ''] || []).includes(
                selectedMessage || ''
              );

              return (
                <>
                  <View style={styles.reactionRow}>
                    {['❤️', '😂', '😮', '😢', '👍'].map((reaction) => (
                      <Pressable
                        key={reaction}
                        style={styles.reactionButton}
                        onPress={() => {
                          if (id && selectedMessage) {
                            setReaction(id, selectedMessage, reaction);
                          }
                          setSelectedMessage(null);
                        }}
                      >
                        <Text style={styles.reactionText}>
                          {reaction}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {(() => {
                    const selected = (messages || []).find(
                      (m) => m.id === selectedMessage
                    );

                    if (selected?.sender !== 'me') return null;

                    return (
                      <Pressable
                        style={styles.menuItem}
                        onPress={() => {
                          if (id && selectedMessage && selected) {
                            setEditingMessage(selectedMessage);
                            setEditingText(selected.text);
                          }

                          setSelectedMessage(null);
                        }}
                      >
                        <Text style={styles.menuText}>
                          ✏️ Edit message
                        </Text>
                      </Pressable>
                    );
                  })()}

                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      if (selectedMessage) {
                        const message = (messages || []).find(
                          (m) => m.id === selectedMessage
                        );

                        if (message) {
                          setReplyingTo(message.text);
                        }
                      }
                      setSelectedMessage(null);
                    }}
                  >
                    <Text style={styles.menuText}>↩️ Reply</Text>
                  </Pressable>

                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      if (id && selectedMessage) {
                        toggleSaveMessage(id, selectedMessage);
                      }
                      setSelectedMessage(null);
                    }}
                  >
                    <Text style={styles.menuText}>
                      {isSaved ? '🔖 Unsave message' : '🔖 Save message'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      if (id && selectedMessage) {
                        deleteMessage(id, selectedMessage);
                      }
                      setSelectedMessage(null);
                    }}
                  >
                    <Text style={styles.deleteText}>🗑️ Delete message</Text>
                  </Pressable>

                  <Pressable
                    style={styles.menuItem}
                    onPress={() => setSelectedMessage(null)}
                  >
                    <Text style={styles.menuText}>✕ Cancel</Text>
                  </Pressable>
                </>
              );
            })()}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={editingMessage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setEditingMessage(null);
          setEditingText('');
        }}
      >
        <Pressable
          style={styles.editOverlay}
          onPress={() => {
            setEditingMessage(null);
            setEditingText('');
          }}
        >
          <Pressable
            style={styles.editBox}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.editTitle}>Edit message</Text>

            <TextInput
              value={editingText}
              onChangeText={setEditingText}
              style={styles.editInput}
              multiline
              autoFocus
              placeholder="Edit your message..."
              placeholderTextColor="#888"
            />

            <View style={styles.editActions}>
              <Pressable
                style={styles.cancelEdit}
                onPress={() => {
                  setEditingMessage(null);
                  setEditingText('');
                }}
              >
                <Text style={styles.cancelEditText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.saveEdit}
                onPress={() => {
                  const value = editingText.trim();

                  if (id && editingMessage && value) {
                    editMessage(id, editingMessage, value);
                  }

                  setEditingMessage(null);
                  setEditingText('');
                }}
              >
                <Text style={styles.saveEditText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {replyingTo && (
        <View style={styles.replyPreview}>
          <View style={styles.replyInfo}>
            <Text style={styles.replyTitle}>Replying to message</Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {replyingTo}
            </Text>
          </View>

          <Pressable onPress={() => setReplyingTo(null)}>
            <Text style={styles.replyCancel}>✕</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor="#888"
          style={styles.input}
          onSubmitEditing={send}
        />

        <Pressable style={styles.sendButton} onPress={send}>
          <Text style={styles.sendText}>➤</Text>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    height: 70,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  back: {
    fontSize: 38,
    lineHeight: 40,
  },
  username: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  typing: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '700',
  },
  online: {
    color: '#2e7d32',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  messages: {
    padding: 15,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  message: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 17,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#111',
    borderBottomRightRadius: 5,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
    borderBottomLeftRadius: 5,
  },
  repliedMessage: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#888',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 6,
  },
  repliedTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666',
    marginBottom: 2,
  },
  repliedText: {
    fontSize: 12,
    color: '#555',
  },
  repliedTextMine: {
    color: '#ddd',
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#fff',
  },
  editedText: {
    fontSize: 10,
    color: '#777',
    marginTop: 3,
    fontStyle: 'italic',
  },
  editedTextMine: {
    color: '#bbb',
  },
  time: {
    fontSize: 10,
    color: '#777',
    marginTop: 4,
    textAlign: 'right',
  },
  myTime: {
    color: '#bbb',
  },
  empty: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: '#777',
    marginTop: 5,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  actionMenu: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingVertical: 10,
    paddingBottom: 25,
  },
  menuItem: {
    paddingHorizontal: 22,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reactionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reactionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  reactionText: {
    fontSize: 22,
  },
  reactionBubble: {
    alignSelf: 'flex-start',
    marginTop: -2,
    marginBottom: 2,
  },
  reactionBubbleText: {
    fontSize: 18,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '700',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: '#f3f3f3',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  replyInfo: {
    flex: 1,
  },
  replyTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  replyText: {
    color: '#666',
    marginTop: 2,
  },
  replyCancel: {
    fontSize: 20,
    paddingHorizontal: 8,
  },
  editOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  editBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },
  editInput: {
    minHeight: 90,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 15,
  },
  cancelEdit: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  cancelEditText: {
    fontWeight: '700',
  },
  saveEdit: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 20,
    backgroundColor: '#111',
  },
  saveEditText: {
    color: '#fff',
    fontWeight: '700',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 23,
    paddingHorizontal: 16,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 19,
  },
});
