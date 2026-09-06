import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function CameraPreview() {
  const params = useLocalSearchParams<{
    uri?: string;
    filter?: string;
  }>();

  const uri = params.uri;
  const filter = params.filter || 'Normal';

  if (!uri) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Photo nahi mili</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  function usePhoto() {
    router.replace({
      pathname: '/tabs/create',
      params: {
        image: uri,
        filter,
      },
    });
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} />

      <View style={styles.top}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.close}>✕</Text>
        </Pressable>

        <View style={styles.filterBox}>
          <Text style={styles.filterText}>✨ {filter}</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Pressable style={styles.retake} onPress={() => router.back()}>
          <Text style={styles.retakeText}>↩ Retake</Text>
        </Pressable>

        <Pressable style={styles.useButton} onPress={usePhoto}>
          <Text style={styles.useText}>✓ Use Photo</Text>
        </Pressable>
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
    ...StyleSheet.absoluteFill,
    resizeMode: 'cover',
  },

  top: {
    position: 'absolute',
    top: 55,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  close: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  filterBox: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  filterText: {
    color: '#fff',
    fontWeight: '700',
  },

  bottom: {
    position: 'absolute',
    bottom: 35,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },

  retake: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },

  retakeText: {
    color: '#fff',
    fontWeight: '700',
  },

  useButton: {
    flex: 1,
    backgroundColor: '#208AEF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },

  useText: {
    color: '#fff',
    fontWeight: '800',
  },

  empty: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 18,
    marginBottom: 15,
  },

  button: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 22,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
