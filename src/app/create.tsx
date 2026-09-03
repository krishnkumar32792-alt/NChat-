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
import { usePostStore } from '@/store/posts';

export default function CreateScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const addPost = usePostStore((state) => state.addPost);

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

  function createPost() {
    if (!image) return;

    addPost({
      id: Date.now().toString(),
      image,
      caption: caption.trim(),
      username: 'Xyz',
      likes: 0,
      liked: false,
      saved: false,
      comments: [],
    });

    setImage(null);
    setCaption('');
    router.replace('/tabs/feed');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Post</Text>

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
        style={styles.caption}
      />

      <Pressable
        style={[styles.postButton, !image && styles.disabled]}
        disabled={!image}
        onPress={createPost}
      >
        <Text style={styles.postText}>Share Post</Text>
      </Pressable>
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
    marginTop: 25,
    marginBottom: 25,
  },
  photoBox: {
    height: 350,
    borderRadius: 18,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  plus: {
    fontSize: 55,
  },
  photoText: {
    color: '#666',
    marginTop: 8,
    fontSize: 16,
  },
  change: {
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '700',
  },
  caption: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  postButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  disabled: {
    opacity: 0.35,
  },
  postText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
