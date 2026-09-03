import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUserStore } from '@/store/users';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const user = useUserStore((state) =>
    state.users.find((item) => item.id === id)
  );

  const toggleFollow = useUserStore((state) => state.toggleFollow);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <Text style={styles.headerName}>{user.username}</Text>

        <View style={{ width: 45 }} />
      </View>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.username}>{user.username}</Text>

        <Text style={styles.bio}>{user.bio}</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.number}>{user.followers}</Text>
            <Text style={styles.label}>Followers</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.number}>{user.following}</Text>
            <Text style={styles.label}>Following</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[
              styles.followButton,
              user.followed && styles.followingButton,
            ]}
            onPress={() => toggleFollow(user.id)}
          >
            <Text
              style={[
                styles.followText,
                user.followed && styles.followingText,
              ]}
            >
              {user.followed ? 'Following' : 'Follow'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.messageButton}
            onPress={() =>
              router.push({
                pathname: '/chat',
                params: { id: user.id },
              })
            }
          >
            <Text style={styles.messageText}>Message</Text>
          </Pressable>
        </View>
      </View>
    </View>
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
    height: 65,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  back: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerName: {
    fontSize: 19,
    fontWeight: '900',
  },
  profile: {
    alignItems: 'center',
    padding: 25,
  },
  avatar: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '900',
  },
  username: {
    fontSize: 23,
    fontWeight: '900',
    marginTop: 15,
  },
  bio: {
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 60,
    marginTop: 25,
  },
  stat: {
    alignItems: 'center',
  },
  number: {
    fontSize: 20,
    fontWeight: '900',
  },
  label: {
    color: '#777',
    marginTop: 3,
  },
  buttons: {
    flexDirection: 'row',
    width: '90%',
    gap: 10,
    marginTop: 25,
  },
  followButton: {
    flex: 1,
    height: 46,
    backgroundColor: '#111',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: '#eee',
  },
  followText: {
    color: '#fff',
    fontWeight: '900',
  },
  followingText: {
    color: '#111',
  },
  messageButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontWeight: '900',
  },
});
