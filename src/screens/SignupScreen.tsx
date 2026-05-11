import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import AppHeader from '../components/AppHeader';

export default function SignupScreen({ navigation, route }: any) {
  const { signup } = useAuth();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const redirectTo: string | undefined = route?.params?.redirectTo;

  const submit = async () => {
    if (!first.trim() || !email.trim() || !password) {
      showToast('Please fill name, email and password.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    setBusy(true);
    const res = await signup({
      first_name: first.trim(),
      last_name: last.trim(),
      email_address: email.trim(),
      password,
      mobile_number: phone.trim(),
    });
    setBusy(false);
    if (res.ok) {
      showToast('Account created. Please verify your email and sign in.', 'success');
      navigation.replace('Login', { redirectTo });
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="slim"
        title="Create Account"
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>First Name *</Text>
          <TextInput style={styles.input} value={first} onChangeText={setFirst} placeholder="Amit" placeholderTextColor="#999" />
          <Text style={styles.label}>Last Name</Text>
          <TextInput style={styles.input} value={last} onChangeText={setLast} placeholder="Sharma" placeholderTextColor="#999" />
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="9876543210"
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Min 6 characters"
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.btn} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.replace('Login', { redirectTo })}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkAccent}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  label: { fontSize: 13, color: '#444', fontWeight: '600', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#FAFAFA',
    marginTop: 6,
    marginBottom: 4,
  },
  btn: {
    backgroundColor: '#182C5A',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.4 },
  linkBtn: { marginTop: 14, alignItems: 'center' },
  linkText: { fontSize: 13, color: '#666' },
  linkAccent: { color: '#182C5A', fontWeight: '600' },
});
