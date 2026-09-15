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
import { useChatStore, type Message } from '@/store/chat';

const EFFECT_PREFIX = '__NCHAT_EFFECT__|';

const EFFECTS = [
  { label: '❤️', value: '❤️', category: 'Love' },
  { label: '💖', value: '💖', category: 'Love' },
  { label: '💋', value: '💋', category: 'Love' },
  { label: '🥰', value: '🥰', category: 'Love' },
  { label: '✨', value: '✨', category: 'Effects' },
  { label: '🔥', value: '🔥', category: 'Effects' },
  { label: '💫', value: '💫', category: 'Effects' },
  { label: '🎉', value: '🎉', category: 'Effects' },
  { label: '🎁', value: '🎁', category: 'Stickers' },
  { label: '😂', value: '😂', category: 'Stickers' },
  { label: '😍', value: '😍', category: 'Stickers' },
  { label: '😎', value: '😎', category: 'Stickers' },
  { label: '👋', value: '👋', category: 'Stickers' },
  { label: '👍', value: '👍', category: 'Stickers' },
  { label: '🫶', value: '🫶', category: 'Stickers' },
  { label: '🌟', value: '🌟', category: 'Effects' },
];

const GIFS = ['😂', '🤣', '😭', '😍', '😎', '🤝', '👏', '🔥'];

function decodeEffect(text: string) {
  if (!text.startsWith(EFFECT_PREFIX)) return null;

  const value = text.slice(EFFECT_PREFIX.length);
  return value || null;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Array.isArray(id) ? id[0] : id || '1';

  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<Message>();
  const [editingId, setEditingId] = useState<string>();
  const [effectsOpen, setEffectsOpen] = useState(false);
  const [effectTab, setEffectTab] = useState<'Effects' | 'GIF' | 'Stickers'>(
    'Effects'
  );

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

  function sendEffect(value: string) {
    sendMessage(userId, `${EFFECT_PREFIX}${value}`);
    setEffectsOpen(false);
  }

  function openActions(item: Message) {
    const actions: any[] = [
      {
        text: 'Reply',
        onPress: () => {
          setReplyTo(item);
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

  const visibleEffects =
    effectTab === 'GIF'
      ? GIFS
      : EFFECTS.filter((item) =>
          effectTab === 'Effects'
            ? item.category === 'Effects' || item.category === 'Love'
            : item.category === 'Stickers'
        ).map((item) => item.value);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
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

        <View style={styles.callButtons}>
          <Pressable
            style={styles.callButton}
            onPress={() =>
              router.push({
                pathname: '/call',
                params: { peerId: userId, type: 'audio' },
              })
            }
          >
            <Text style={styles.callIcon}>📞</Text>
          </Pressable>

          <Pressable
            style={styles.callButton}
            onPress={() =>
              router.push({
                pathname: '/call',
                params: { peerId: userId, type: 'video' },
              })
            }
          >
            <Text style={styles.callIcon}>🎥</Text>
          </Pressable>
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
        renderItem={({ item }) => {
          const effect = decodeEffect(item.text);

          return (
            <Pressable
              onLongPress={() => openActions(item)}
              onPress={() => {
                if (item.sender === 'them') {
                  markMessageSeen(userId, item.id);
                }
              }}
              style={[
                styles.message,
                item.sender === 'me'
                  ? styles.myMessage
                  : styles.otherMessage,
                effect ? styles.effectMessage : null,
              ]}
            >
              {item.replyTo && (
                <View style={styles.replyPreview}>
                  <Text numberOfLines={1}>{item.replyTo.text}</Text>
                </View>
              )}

              {effect ? (
                <Text style={styles.bigEffect}>{effect}</Text>
              ) : (
                <Text
                  style={
                    item.sender === 'me'
                      ? styles.myMessageText
                      : styles.otherMessageText
                  }
                >
                  {item.text}
                </Text>
              )}

              <View style={styles.meta}>
                <Text
                  style={
                    item.sender === 'me'
                      ? styles.myTime
                      : styles.otherTime
                  }
                >
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>Start a conversation 👋</Text>
          </View>
        }
      />

      {effectsOpen && (
        <View style={styles.effectsPanel}>
          <View style={styles.effectsHeader}>
            <Text style={styles.effectsTitle}>✨ NChat Effects</Text>
            <Pressable onPress={() => setEffectsOpen(false)}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          <View style={styles.tabs}>
            {(['Effects', 'GIF', 'Stickers'] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setEffectTab(tab)}
                style={[
                  styles.tab,
                  effectTab === tab && styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    effectTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.effectGrid}>
            {visibleEffects.map((value, index) => (
              <Pressable
                key={`${value}-${index}`}
                style={styles.effectItem}
                onPress={() => sendEffect(value)}
              >
                <Text style={styles.effectEmoji}>{value}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View style={styles.inputRow}>
        <Pressable
          style={styles.plusButton}
          onPress={() => setEffectsOpen((value) => !value)}
        >
          <Text style={styles.plusText}>＋</Text>
        </Pressable>

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
  callButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    padding: 5,
  },
  callIcon: {
    fontSize: 21,
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
  effectMessage: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'transparent',
  },
  bigEffect: {
    fontSize: 58,
    textAlign: 'center',
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
    alignItems: 'flex-end',
    padding: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  plusButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 28,
    color: '#208AEF',
    marginTop: -2,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 21,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  send: {
    minWidth: 58,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
  },
  effectsPanel: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    paddingBottom: 8,
  },
  effectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  effectsTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 8,
    marginTop: 5,
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#f1f1f1',
  },
  activeTab: {
    backgroundColor: '#208AEF',
  },
  tabText: {
    color: '#555',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  effectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  effectItem: {
    width: '16.66%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectEmoji: {
    fontSize: 32,
  },
});
