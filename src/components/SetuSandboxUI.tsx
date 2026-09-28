import React, { useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { startDigiLockerAuthorization, submitVehicleRequest, getSetuUiMessage } from '../services/api-setu';

export default function SetuSandboxUI() {
  const [registrationNumber, setRegistrationNumber] = useState('KA01AB1234');
  const [vehicleStatus, setVehicleStatus] = useState('');
  const [isVehicleLoading, setIsVehicleLoading] = useState(false);
  const [digilockerStatus, setDigilockerStatus] = useState('');
  const [isDigilockerLoading, setIsDigilockerLoading] = useState(false);

  const vehicleButtonLabel = useMemo(() => (isVehicleLoading ? 'Submitting...' : 'Submit vehicle request'), [isVehicleLoading]);
  const digilockerButtonLabel = useMemo(() => (isDigilockerLoading ? 'Redirecting...' : 'Connect DigiLocker'), [isDigilockerLoading]);

  async function handleVehicleSubmit() {
    setIsVehicleLoading(true);
    setVehicleStatus('');
    try {
      const result = await submitVehicleRequest(registrationNumber);
      setVehicleStatus(JSON.stringify(result, null, 2));
    } catch (error) {
      Alert.alert('Vehicle request failed', getSetuUiMessage(error));
      setVehicleStatus(getSetuUiMessage(error));
    } finally {
      setIsVehicleLoading(false);
    }
  }

  async function handleDigiLockerConnect() {
    setIsDigilockerLoading(true);
    setDigilockerStatus('');
    try {
      const result = await startDigiLockerAuthorization();
      setDigilockerStatus(`Authorization URL ready: ${result.authUrl}`);
    } catch (error) {
      Alert.alert('DigiLocker failed', getSetuUiMessage(error));
      setDigilockerStatus(getSetuUiMessage(error));
    } finally {
      setIsDigilockerLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>API Setu Sandbox</Text>
        <Text style={styles.subtitle}>Server-side flows via Supabase Edge Functions</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>DigiLocker</Text>
          <Text style={styles.cardText}>Starts the authorization flow without exposing API Setu secrets in React Native.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleDigiLockerConnect} disabled={isDigilockerLoading}>
            <Text style={styles.primaryButtonText}>{digilockerButtonLabel}</Text>
          </TouchableOpacity>
          {digilockerStatus ? <Text style={styles.output}>{digilockerStatus}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle Services</Text>
          <Text style={styles.cardText}>Submit a vehicle request only through the Supabase Function layer.</Text>
          <TextInput
            style={styles.input}
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            placeholder="KA01AB1234"
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleVehicleSubmit} disabled={isVehicleLoading}>
            <Text style={styles.primaryButtonText}>{vehicleButtonLabel}</Text>
          </TouchableOpacity>
          {vehicleStatus ? <Text style={styles.output}>{vehicleStatus}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f6f4',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#19251f',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#5d6d66',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5ece7',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18251f',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: '#556760',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dce7df',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#1a6b4d',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  output: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: '#2d473a',
  },
});
