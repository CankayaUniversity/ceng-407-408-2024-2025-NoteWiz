// src/screens/DiagnosticScreen.tsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import ApiDiagnostic from '../components/debug/ApiDiagnostic';

const DiagnosticScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ApiDiagnostic />
    </SafeAreaView>
  );
};

export default DiagnosticScreen;