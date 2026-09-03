import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';

const notifications = [
  {
    id: '1',
    icon: '❤️',
    username: 'alex',
    text: 'liked your post',
    time: '2m',
  },
  {
    id: '2',
    icon: '💬',
    username: 'rahul',
    text: 'commented on your post',
    time: '15m',
  },
  {
    id: '3',
    icon: '👤',
    username: 'riya',
    text: 'started following you',
    time: '1h',
  },
  {
    id: '4',
    icon: '❤️',
    username: 'alex',
    text: 'liked your post',
    time: '3h',
  },
];

export default function NotificationsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Stay updated with NChat</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent</Text>

        {notifications.map((item) => (
          <Pressable key={item.id} style={styles.card}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.message}>
                <Text style={styles.username}>@{item.username}</Text>{' '}
                {item.text}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.emptyBox}>
        <Text style={styles.emptyIcon}>🔔</Text>
        <Text style={styles.emptyTitle}>You're all caught up</Text>
        <Text style={styles.emptyText}>
          New activity will appear here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  header: {
    marginTop: 25,
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111',
  },
  subtitle: {
    marginTop: 5,
    color: '#777',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 19,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  message: {
    fontSize: 15,
    color: '#333',
    lineHeight: 21,
  },
  username: {
    fontWeight: '800',
    color: '#111',
  },
  time: {
    marginTop: 3,
    color: '#999',
    fontSize: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 18,
    padding: 25,
    borderRadius: 18,
    backgroundColor: '#f7f7f7',
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 5,
    color: '#777',
  },
});
