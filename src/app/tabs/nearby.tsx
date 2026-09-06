import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

const demoUsers = [
  { id: '1', name: 'NChat User', username: '@nearby_user' },
  { id: '2', name: 'New Friend', username: '@newfriend' },
  { id: '3', name: 'NChat Member', username: '@member' },
];

export default function NearbyScreen() {
  const [enabled, setEnabled] = useState(false);
  const [sent, setSent] = useState<string[]>([]);

  const sendRequest = (id: string, name: string) => {
    setSent(prev => prev.includes(id) ? prev : [...prev, id]);
    Alert.alert('Request sent', `Your connect request was sent to ${name}.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Connect 👥</Text>
      <Text style={styles.subtitle}>
        Discover opted-in people nearby without searching their ID.
      </Text>

      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Appear in Nearby</Text>
          <Text style={styles.cardText}>
            Only show your profile when you choose to be discoverable.
          </Text>
        </View>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>

      {!enabled ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👋</Text>
          <Text style={styles.emptyTitle}>Nearby is off</Text>
          <Text style={styles.emptyText}>
            Turn it on to see opted-in nearby users.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.section}>People nearby</Text>
          <FlatList
            data={demoUsers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const requested = sent.includes(item.id);
              return (
                <View style={styles.user}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.username}>{item.username}</Text>
                    <Text style={styles.nearby}>Nearby • approximate only</Text>
                  </View>
                  <Pressable
                    style={[styles.button, requested && styles.buttonDone]}
                    disabled={requested}
                    onPress={() => sendRequest(item.id, item.name)}
                  >
                    <Text style={styles.buttonText}>
                      {requested ? 'Sent ✓' : 'Connect'}
                    </Text>
                  </Pressable>
                </View>
              );
            }}
          />
        </>
      )}

      <Text style={styles.note}>
        🔒 Exact location is never shown. Requests must be accepted before chat.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 18 },
  subtitle: { color: '#666', fontSize: 14, marginTop: 6, marginBottom: 18 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginBottom: 22,
  },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardText: { color: '#666', marginTop: 4, paddingRight: 10 },
  empty: { alignItems: 'center', marginTop: 70 },
  emptyIcon: { fontSize: 50 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  emptyText: { color: '#777', marginTop: 6, textAlign: 'center' },
  section: { fontSize: 19, fontWeight: '700', marginBottom: 12 },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e9e9e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '700' },
  username: { color: '#777', marginTop: 2 },
  nearby: { color: '#999', fontSize: 11, marginTop: 3 },
  button: {
    backgroundColor: '#111',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
  },
  buttonDone: { backgroundColor: '#777' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  note: {
    color: '#777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
});
