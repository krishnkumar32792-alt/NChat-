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
  const receiveMessage = useChatStore((state) => state.receiveMessage);

  useEffect(() => {
    if (id) markRead(id);
  }, [id, markRead]);

  const [text, setText] = useState('');

  function send() {
    const message = text.trim();

    if (!message || !id) return;

    sendMessage(id, message);
    setText('');
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
          <Text style={styles.online}>● Online</Text>
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
              if (window.confirm('Delete this message?')) {
                deleteMessage(id || '', item.id);
              }
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
            <Text
              style={[
                styles.messageText,
                item.sender === 'me' && styles.myMessageText,
              ]}
            >
              {item.text}
            </Text>

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
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#fff',
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
