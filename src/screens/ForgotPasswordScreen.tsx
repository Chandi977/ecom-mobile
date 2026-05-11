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
import { apiPost } from '../services/api';
import { showToast } from '../utils/toast';
import AppHeader from '../components/AppHeader';

type Step = 'request' | 'verify' | 'set';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const requestOtp = async () => {
    if (!email.trim()) {
      showToast('Please enter your email.', 'error');
      return;
    }
    setBusy(true);
    const res = await apiPost('reset/password/otp', { email: email.trim() });
    setBusy(false);
    if (res.ok) {
      showToast('OTP sent to your email.', 'success');
      setStep('verify');
    } else {
      showToast(res.message, 'error');
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      showToast('Enter the OTP.', 'error');
      return;
    }
    setBusy(true);
    const res = await apiPost('reset/password/verify/otp', { email: email.trim(), otp: otp.trim() });
    setBusy(false);
    if (res.ok) {
      setStep('set');
    } else {
      showToast(res.message, 'error');
    }
  };

  const updatePassword = async () => {
    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    setBusy(true);
    const res = await apiPost('reset/password/update', {
      email_address: email.trim(),
      new_password: password,
      confirm_password: confirm,
    });
    setBusy(false);
    if (res.ok) {
      showToast('Password updated. Please sign in.', 'success');
      navigation.replace('Login');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="slim"
        title="Reset Password"
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {step === 'request' && (
            <>
              <Text style={styles.label}>Registered Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.btn} onPress={requestOtp} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
              </TouchableOpacity>
            </>
          )}
          {step === 'verify' && (
            <>
              <Text style={styles.note}>We sent an OTP to {email}.</Text>
              <Text style={styles.label}>OTP</Text>
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter OTP"
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.btn} onPress={verifyOtp} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify OTP</Text>}
              </TouchableOpacity>
            </>
          )}
          {step === 'set' && (
            <>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="New password"
                secureTextEntry
                placeholderTextColor="#999"
              />
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Confirm password"
                secureTextEntry
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.btn} onPress={updatePassword} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Password</Text>}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  label: { fontSize: 13, color: '#444', fontWeight: '600', marginTop: 8 },
  note: { fontSize: 13, color: '#555', marginBottom: 8 },
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
});
