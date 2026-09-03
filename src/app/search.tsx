import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useUserStore } from '@/store/users';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const users = useUserStore((state) => state.users);

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();

    if (!text) return users;

    return users.filter((user) =>
      user.username.toLowerCase().includes(text)
    );
  }, [query, users]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search username..."
        placeholderTextColor="#888"
        style={styles.search}
        autoCapitalize="none"
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            style={styles.user}
            onPress={() =>
              router.push({
                pathname: './user-profile',
                params: { id: item.id },
              })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.username.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.bio} numberOfLines={1}>
                {item.bio}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No users found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 18,
  },
  search: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    width: 55,
    height: 55,
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
  username: {
    fontSize: 17,
    fontWeight: '800',
  },
  bio: {
    color: '#777',
    marginTop: 3,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#777',
  },
});
