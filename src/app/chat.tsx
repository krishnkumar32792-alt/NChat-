import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
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
  const [replyTo, setReplyTo] = useState<{ id: string; text: string }>();
  const [editingId, setEditingId] = useState<string>();

  const messages = useChatStore((state) => state.messages[userId] || []);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const loadMessages = useChatStore((state) => state.loadMessages);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const editMessage = useChatStore((state) => state.editMessage);
  const markMessageSeen = useChatStore((state) => state.markMessageSeen);
  const toggleSaveMessage = useChatStore((state) => state.toggleSaveMessage);
  const setReaction = useChatStore((state) => state.setReaction);

  useEffect(() => {
    loadMessages(userId);
  }, [userId, loadMessages]);

  function handleSend() {
    const value = text.trim();
    if (!value) return;

    if (editingId) {
      editMessage(userId, editingId, value);
      setEditingId(undefined);
    } else {
      sendMessage(userId, value, replyTo);
      setReplyTo(undefined);
    }

    setText('');
  }

  function openActions(item: any) {
    const actions: any[] = [
      {
        text: 'Reply',
        onPress: () => {
          setReplyTo({ id: item.id, text: item.text });
          setEditingId(undefined);
        },
      },
      {
        text: 'React ❤️',
        onPress: () => setReaction(userId, item.id, '❤️'),
      },
      {
        text: 'Save',
        onPress: () => toggleSaveMessage(userId, item.id),
      },
    ];

    if (item.sender === 'me') {
      actions.push({
        text: 'Edit',
        onPress: () => {
          setEditingId(item.id);
          setReplyTo(undefined);
          setText(item.text);
        },
      });

      actions.push({
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMessage(userId, item.id),
      });
    }

    actions.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Message', 'Choose an action', actions);
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
          <Text style={styles.title}>
            {userId === '1'
              ? 'alex'
              : userId === '2'
              ? 'rahul'
              : userId === '3'
              ? 'riya'
              : 'Chat'}
          </Text>
          <Text style={styles.subtitle}>Online</Text>
        </View>
      </View>

      {replyTo && (
        <View style={styles.replyBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.replyTitle}>Replying to</Text>
            <Text numberOfLines={1}>{replyTo.text}</Text>
          </View>
          <Pressable onPress={() => setReplyTo(undefined)}>
            <Text style={styles.close}>×</Text>
          </Pressable>
        </View>
      )}

      {editingId && (
        <View style={styles.editBar}>
          <Text style={styles.editText}>Editing message</Text>
          <Pressable
            onPress={() => {
              setEditingId(undefined);
              setText('');
            }}
          >
            <Text style={styles.close}>×</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() => openActions(item)}
            onPress={() => {
              if (item.sender === 'other') {
                markMessageSeen(userId, item.id);
              }
            }}
            style={[
              styles.message,
              item.sender === 'me'
                ? styles.myMessage
                : styles.otherMessage,
            ]}
          >
            {item.replyTo && (
              <View style={styles.replyPreview}>
                <Text numberOfLines={1}>{item.replyTo.text}</Text>
              </View>
            )}

            <Text
              style={
                item.sender === 'me'
                  ? styles.myMessageText
                  : styles.otherMessageText
              }
            >
              {item.text}
            </Text>

            <View style={styles.meta}>
              <Text
                style={
                  item.sender === 'me'
                    ? styles.myTime
                    : styles.otherTime
                }
              >
                {item.time}
                {item.edited ? ' · edited' : ''}
              </Text>

              {item.sender === 'me' && (
                <Text style={styles.seen}>
                  {item.seen ? '✓✓' : '✓'}
                </Text>
              )}
            </View>

            {item.reaction && (
              <View style={styles.reaction}>
                <Text>{item.reaction}</Text>
              </View>
            )}
          </Pressable>
        )}
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
          placeholder={editingId ? 'Edit message...' : 'Message...'}
          style={styles.input}
          multiline
        />

        <Pressable style={styles.send} onPress={handleSend}>
          <Text style={styles.sendText}>
            {editingId ? 'Save' : 'Send'}
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
  list: {
    padding: 16,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
  },
  message: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#208AEF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
  },
  myMessageText: {
    color: '#fff',
    fontSize: 16,
  },
  otherMessageText: {
    color: '#111',
    fontSize: 16,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  myTime: {
    color: '#dceeff',
    fontSize: 10,
  },
  otherTime: {
    color: '#777',
    fontSize: 10,
  },
  seen: {
    color: '#dceeff',
    fontSize: 11,
  },
  replyPreview: {
    padding: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#999',
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 5,
  },
  reaction: {
    position: 'absolute',
    bottom: -8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  replyBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f3f7ff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  replyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#208AEF',
  },
  editBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff6d8',
  },
  editText: {
    fontWeight: '600',
  },
  close: {
    fontSize: 25,
    paddingHorizontal: 8,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
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
