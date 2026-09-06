import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/auth';

export default function SignupScreen() {
  const signup = useAuthStore((state) => state.signup);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');

    if (!username.trim() || !email.trim() || !password) {
      setError('All fields are required');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    const success = await signup(username, password);

    if (!success) {
      setError('Username already exists');
      return;
    }

    router.replace('/tabs/feed');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <View style={styles.logoBox}>
          <Text style={styles.logo}>NChat</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Join NChat 🚀</Text>
          <Text style={styles.subheading}>
            Create your account to get started.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
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
              styles.signupButton,
              pressed && styles.pressed,
            ]}
            onPress={handleSignup}
          >
            <Text style={styles.signupText}>Create Account</Text>
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>Already have an account?</Text>

            <Pressable onPress={() => router.back()}>
              <Text style={styles.loginLink}> Log in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  back: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 25,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
  },
  tagline: {
    color: '#666',
    marginTop: 5,
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
  signupButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  signupText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  loginLabel: {
    color: '#666',
  },
  loginLink: {
    fontWeight: '800',
  },
});
