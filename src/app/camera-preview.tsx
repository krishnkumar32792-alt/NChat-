import { router, useLocalSearchParams } from 'expo-router';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function CameraPreviewScreen() {
  const { uri, filter } = useLocalSearchParams<{
    uri?: string;
    filter?: string;
  }>();

  return (
    <View style={styles.container}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>No photo</Text>
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.top}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.close}>✕</Text>
          </Pressable>

          <Text style={styles.filter}>
            {filter || 'Normal'}
          </Text>
        </View>

        <View style={styles.bottom}>
          <Pressable
            style={styles.button}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.useButton]}
            onPress={() => {
              if (!uri) return;

              router.replace({
                pathname: '/tabs/create',
                params: { image: uri },
              });
            }}
          >
            <Text style={styles.useText}>Use Photo</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  noImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noImageText: {
    color: '#fff',
    fontSize: 18,
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },

  top: {
    marginTop: 48,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  close: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },

  filter: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    fontWeight: '800',
  },

  bottom: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 35,
  },

  button: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  useButton: {
    backgroundColor: '#fff',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  useText: {
    color: '#111',
    fontWeight: '900',
    fontSize: 16,
  },
});

