import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function login() {
    if (username.trim().toLowerCase() === 'xyz' && password === '12345') {
      setError('');
      router.push('/tabs/feed');
      return;
    }

    setError('Username ya password galat hai.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>NChat</Text>
        <Text style={styles.subtitle}>Connect. Share. Chat.</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.loginButton} onPress={login}>
          <Text style={styles.loginText}>Log In</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/signup')}>
          <Text style={styles.signup}>
            Don't have an account? <Text style={styles.bold}>Sign Up</Text>
          </Text>
        </Pressable>

        <Text style={styles.demo}>
          Demo account{'\n'}
          Username: Xyz{'\n'}
          Password: 12345
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
  },

  logo: {
    fontSize: 46,
    fontWeight: '900',
    textAlign: 'center',
  },

  subtitle: {
    textAlign: 'center',
    color: '#777',
    marginTop: 8,
    marginBottom: 40,
  },

  input: {
    height: 52,
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },

  loginButton: {
    height: 52,
    backgroundColor: '#111',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  error: {
    color: '#d00',
    textAlign: 'center',
    marginBottom: 5,
  },

  signup: {
    textAlign: 'center',
    marginTop: 25,
    color: '#555',
  },

  bold: {
    fontWeight: '800',
    color: '#111',
  },

  demo: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 35,
    lineHeight: 20,
  },
});
