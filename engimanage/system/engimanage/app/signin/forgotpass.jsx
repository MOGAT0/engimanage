import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function ForgotPasswordScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we’ll send you instructions to reset your password.
        </Text>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Send Reset Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#f2f2f2',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: 350,
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      elevation: 10,
      marginTop:-150
    },
    title: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 10,
    },
    subtitle: {
      textAlign: 'center',
      fontSize: 12,
      color: '#747474',
      marginBottom: 20,
    },
    form: {
      gap: 15,
    },
    input: {
      borderRadius: 20,
      borderColor: '#c0c0c0',
      borderWidth: 1,
      padding: 12,
      paddingHorizontal: 15,
      fontSize: 14,
    },
    resetButton: {
      backgroundColor: '#332277',
      padding: 12,
      borderRadius: 20,
      alignItems: 'center',
      elevation: 3,
    },
    resetButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });
  