import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { usePostStore } from '@/store/posts';
import { useProfileStore } from '@/store/profile';
import { useAuthStore } from '@/store/auth';

export default function CreateScreen() {
  const params = useLocalSearchParams<{ image?: string }>();

  const profile = useProfileStore((state) => state.profile);
  const addPost = usePostStore((state) => state.addPost);
  const authUsername = useAuthStore((state) => state.username);

  const [image, setImage] = useState<string | null>(params.image ?? null);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (params.image) {
      setImage(params.image);
    }
  }, [params.image]);

  async function choosePhoto() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  }

  async function createPost() {
    if (!image || posting) return;

    setPosting(true);

    const username =
      authUsername?.trim() ||
      profile.username?.trim() ||
      'Xyz';

    addPost({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      image,
      caption: caption.trim(),
      username,
      likes: 0,
      liked: false,
      saved: false,
      comments: [],
    });

    setImage(null);
    setCaption('');
    setPosting(false);

    router.replace('/tabs/feed');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <Text style={styles.title}>Create Post</Text>

        <View style={{ width: 30 }} />
      </View>

      <View style={styles.sourceRow}>
        <Pressable
          style={styles.cameraButton}
          onPress={() => router.push('/camera')}
        >
          <Text style={styles.cameraText}>📷 Camera</Text>
        </Pressable>

        <Pressable
          style={styles.galleryButton}
          onPress={choosePhoto}
        >
          <Text style={styles.galleryText}>🖼 Gallery</Text>
        </Pressable>
      </View>

      <Pressable style={styles.photoBox} onPress={choosePhoto}>
        {image ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : (
          <>
            <Text style={styles.plus}>＋</Text>
            <Text style={styles.photoText}>Choose Photo</Text>
          </>
        )}
      </Pressable>

      {image && (
        <Pressable onPress={choosePhoto}>
          <Text style={styles.change}>Change Photo</Text>
        </Pressable>
      )}

      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="Write a caption..."
        placeholderTextColor="#888"
        multiline
        maxLength={500}
        style={styles.caption}
      />

      <Text style={styles.counter}>{caption.length}/500</Text>

      <Pressable
        style={[styles.postButton, !image && styles.disabled]}
        disabled={!image || posting}
        onPress={createPost}
      >
        <Text style={styles.postText}>
          {posting ? 'Sharing...' : 'Share Post'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
  },
  header: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    fontSize: 38,
    color: '#111',
    lineHeight: 40,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111',
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#208AEF',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  cameraText: {
    color: '#fff',
    fontWeight: '700',
  },
  galleryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#208AEF',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  galleryText: {
    color: '#208AEF',
    fontWeight: '700',
  },
  photoBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  plus: {
    fontSize: 52,
    color: '#208AEF',
  },
  photoText: {
    marginTop: 4,
    color: '#777',
    fontSize: 15,
  },
  change: {
    textAlign: 'center',
    color: '#208AEF',
    fontWeight: '700',
    marginTop: 10,
  },
  caption: {
    marginTop: 15,
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 13,
    color: '#111',
    textAlignVertical: 'top',
  },
  counter: {
    textAlign: 'right',
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  postButton: {
    backgroundColor: '#208AEF',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 18,
  },
  disabled: {
    opacity: 0.45,
  },
  postText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
