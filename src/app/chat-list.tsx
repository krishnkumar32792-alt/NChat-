import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/users';

export default function ChatListScreen() {
  const users = useUserStore((state) => state.users);
  const unread = useChatStore((state) => state.unread);
  const messages = useChatStore((state) => state.messages);

  const sortedUsers = [...users].sort((a, b) => {
    const aMessages = messages[a.id] || [];
    const bMessages = messages[b.id] || [];

    const aLast = aMessages[aMessages.length - 1];
    const bLast = bMessages[bMessages.length - 1];

    if (!aLast && !bLast) return 0;
    if (!aLast) return 1;
    if (!bLast) return -1;

    return Number(bLast.id) - Number(aLast.id);
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
      </View>

      {sortedUsers.map((user) => {
        const userMessages = messages[user.id] || [];
        const lastMessage = userMessages[userMessages.length - 1];
        const unreadCount = unread[user.id] || 0;

        return (
          <Pressable
            key={user.id}
            style={styles.row}
            onPress={() =>
              router.push({
                pathname: '/chat',
                params: { id: user.id },
              })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.username}>
                  {user.username}
                </Text>

                <Text style={styles.time}>
                  {lastMessage?.time || 'Now'}
                </Text>
              </View>

              <View style={styles.messageRow}>
                <Text
                  style={[
                    styles.lastMessage,
                    unreadCount > 0 && styles.unreadMessage,
                  ]}
                  numberOfLines={1}
                >
                  {lastMessage?.text || 'Tap to start chatting'}
                </Text>

                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        );
      })}

      {users.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No chats yet</Text>
          <Text style={styles.emptyText}>
            Find someone and start a conversation.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 70,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    fontSize: 17,
    fontWeight: '800',
  },
  time: {
    color: '#999',
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  lastMessage: {
    flex: 1,
    color: '#777',
  },
  unreadMessage: {
    color: '#111',
    fontWeight: '800',
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: '#777',
    marginTop: 6,
    textAlign: 'center',
  },
});
