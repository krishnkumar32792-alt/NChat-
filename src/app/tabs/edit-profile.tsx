import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuthStore } from '@/store/auth';
import { useProfileStore } from '@/store/profile';

export default function EditProfileScreen() {
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const authUsername = useAuthStore((state) => state.username);

  const [username, setUsername] = useState(
    profile.username || authUsername || ''
  );
  const [bio, setBio] = useState(profile.bio || '');
  const [avatar, setAvatar] = useState(profile.avatar || '');

  async function chooseAvatar() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  }

  function saveProfile() {
    const cleanUsername = username.trim();

    if (!cleanUsername) return;

    setProfile({
      username: cleanUsername,
      bio: bio.trim(),
      avatar,
    });

    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>

        <Text style={styles.title}>Edit Profile</Text>

        <Pressable onPress={saveProfile}>
          <Text style={styles.save}>Save</Text>
        </Pressable>
      </View>

      <Pressable style={styles.avatarBox} onPress={chooseAvatar}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(username || 'X').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.changePhoto}>Change photo</Text>
      </Pressable>

      <Text style={styles.label}>Username</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#888"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Bio</Text>

      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Write something about yourself..."
        placeholderTextColor="#888"
        style={[styles.input, styles.bioInput]}
        multiline
        maxLength={150}
        textAlignVertical="top"
      />

      <Text style={styles.counter}>{bio.length}/150</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 65,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 19, fontWeight: '900' },
  cancel: { color: '#555' },
  save: { fontWeight: '900' },
  avatarBox: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 40, fontWeight: '900' },
  changePhoto: { marginTop: 10, fontWeight: '800' },
  label: {
    fontWeight: '800',
    marginHorizontal: 20,
    marginBottom: 7,
  },
  input: {
    marginHorizontal: 20,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    color: '#111',
  },
  bioInput: {
    height: 100,
    paddingTop: 12,
  },
  counter: {
    textAlign: 'right',
    marginRight: 20,
    color: '#888',
  },
});
