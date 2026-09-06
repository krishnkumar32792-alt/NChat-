import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/auth';

export default function LoginScreen() {
  const { login, hydrate, hydrated, username } = useAuthStore();

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && username) {
      router.replace('/tabs/feed');
    }
  }, [hydrated, username]);

  const handleLogin = async () => {
    setError('');

    if (!user.trim() || !password) {
      setError('Username and password required');
      return;
    }

    const success = await login(user, password);

    if (!success) {
      setError('Invalid username or password');
      return;
    }

    router.replace('/tabs/feed');
  };

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading NChat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoBox}>
          <Text style={styles.logo}>NChat</Text>
          <Text style={styles.tagline}>Connect. Chat. Share.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Welcome back 👋</Text>
          <Text style={styles.subheading}>
            Login to continue to NChat.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            value={user}
            onChangeText={setUser}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={10}
            >
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.pressed,
            ]}
            onPress={handleLogin}
          >
            <Text style={styles.loginText}>Log In</Text>
          </Pressable>

          <View style={styles.signupRow}>
            <Text style={styles.signupLabel}>New to NChat?</Text>

            <Pressable onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}> Create Account</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>
          Your account stays saved on this device.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    fontSize: 44,
    fontWeight: '900',
  },
  tagline: {
    color: '#666',
    marginTop: 5,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  heading: {
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 6,
  },
  subheading: {
    color: '#666',
    marginBottom: 22,
  },
  passwordRow: {
    position: 'relative',
    marginBottom: 12,
  },
  passwordInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingRight: 52,
    backgroundColor: '#fafafa',
    color: '#111',
    fontSize: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    height: 52,
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 19,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    color: '#111',
    fontSize: 15,
  },
  error: {
    color: '#d00',
    marginBottom: 10,
    fontSize: 13,
  },
  loginButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  loginText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  signupLabel: {
    color: '#666',
  },
  signupLink: {
    fontWeight: '800',
  },
  footer: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 22,
  },
});
