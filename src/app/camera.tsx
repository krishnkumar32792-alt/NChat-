import { router } from 'expo-router';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const filters = [
  { name: 'Normal', emoji: '✨', overlay: 'transparent', effect: '' },
  { name: 'Warm', emoji: '🌅', overlay: 'rgba(255,140,0,0.10)', effect: '' },
  { name: 'Cool', emoji: '❄️', overlay: 'rgba(0,140,255,0.10)', effect: '' },
  { name: 'Pink', emoji: '🌸', overlay: 'rgba(255,0,120,0.10)', effect: '💗' },
  { name: 'Hearts', emoji: '❤️', overlay: 'transparent', effect: '♥  ♥  ♥' },
  { name: 'Crown', emoji: '👑', overlay: 'transparent', effect: '👑' },
  { name: 'Glasses', emoji: '😎', overlay: 'transparent', effect: '😎' },
  { name: 'Dog', emoji: '🐶', overlay: 'rgba(120,70,20,0.06)', effect: '🐶  🐾' },
  { name: 'Bunny', emoji: '🐰', overlay: 'rgba(255,180,220,0.06)', effect: '🐰' },
  { name: 'Sparkle', emoji: '✨', overlay: 'transparent', effect: '✦  ✧  ✦' },
];

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [ready, setReady] = useState(false);

  if (!permission) return <View style={styles.black} />;

  if (!permission.granted) {
    return (
      <View style={styles.permission}>
        <Text style={styles.permissionTitle}>NChat Camera</Text>
        <Text style={styles.permissionText}>Camera permission is required for photos and filters.</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}><Text style={styles.cancel}>Cancel</Text></Pressable>
      </View>
    );
  }

  const active = filters[selectedFilter];

  async function takePhoto() {
    if (!cameraRef.current || !ready) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) {
        router.push({ pathname: '/camera-preview' as any, params: { uri: photo.uri, filter: active.name } });
      }
    } catch (error) {
      console.log('CAMERA_ERROR:', error);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} onCameraReady={() => setReady(true)} />
      <View
        pointerEvents="none"
        style={[styles.filterOverlay, { backgroundColor: active.overlay }]}
      />
      {!!active.effect && (
        <View pointerEvents="none" style={styles.effectOverlay}>
          <Text style={styles.effectText}>{active.effect}</Text>
        </View>
      )}

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}><Text style={styles.topButton}>✕</Text></Pressable>
        <Text style={styles.title}>NChat Camera</Text>
        <Pressable onPress={() => setFacing(v => v === 'back' ? 'front' : 'back')} style={styles.iconButton}><Text style={styles.topButton}>↻</Text></Pressable>
      </View>

      <View style={styles.activePill}>
        <Text style={styles.activeEmoji}>{active.emoji}</Text>
        <Text style={styles.activeText}>{active.name}</Text>
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>FILTERS</Text>
          <Text style={styles.filterCount}>{selectedFilter + 1}/{filters.length}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {filters.map((filter, index) => (
            <Pressable key={filter.name} onPress={() => setSelectedFilter(index)} style={[styles.filterButton, selectedFilter === index && styles.filterSelected]}>
              <Text style={styles.filterEmoji}>{filter.emoji}</Text>
              <Text style={[styles.filterText, selectedFilter === index && styles.filterTextSelected]}>{filter.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable style={[styles.captureOuter, !ready && styles.disabled]} onPress={takePhoto} disabled={!ready}>
          <View style={styles.captureInner} />
        </Pressable>
        <Text style={styles.hint}>Tap a filter, then capture</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  black: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  filterOverlay: { ...StyleSheet.absoluteFill },
  effectOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 180,
  },
  effectText: {
    fontSize: 52,
    textAlign: 'center',
    letterSpacing: 12,
  },
  topBar: { position: 'absolute', top: 44, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  topButton: { color: '#fff', fontSize: 27, fontWeight: '800' },
  title: { color: '#fff', fontSize: 19, fontWeight: '900' },
  activePill: { position: 'absolute', top: 104, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.58)' },
  activeEmoji: { fontSize: 18, marginRight: 7 },
  activeText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  bottomPanel: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, paddingBottom: 24, backgroundColor: 'rgba(0,0,0,0.58)' },
  filterHeader: { paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  filterTitle: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 1.2 },
  filterCount: { color: '#ddd', fontSize: 12, fontWeight: '700' },
  filterList: { paddingHorizontal: 12, paddingBottom: 12 },
  filterButton: { width: 72, height: 68, marginHorizontal: 4, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.13)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  filterSelected: { backgroundColor: '#fff', borderColor: '#fff', transform: [{ scale: 1.04 }] },
  filterEmoji: { fontSize: 22 },
  filterText: { color: '#fff', fontSize: 10, fontWeight: '800', marginTop: 4 },
  filterTextSelected: { color: '#111' },
  captureOuter: { width: 82, height: 82, borderRadius: 41, borderWidth: 5, borderColor: '#fff', alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#fff' },
  disabled: { opacity: 0.4 },
  hint: { color: '#ccc', textAlign: 'center', fontSize: 11, marginTop: 7 },
  permission: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 25 },
  permissionTitle: { fontSize: 28, fontWeight: '900' },
  permissionText: { marginTop: 10, color: '#666', textAlign: 'center' },
  permissionButton: { marginTop: 25, backgroundColor: '#111', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 12 },
  permissionButtonText: { color: '#fff', fontWeight: '800' },
  cancel: { marginTop: 18, color: '#111', fontWeight: '700' },
});
