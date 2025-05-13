// src/components/debug/ApiDiagnostic.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { apiClient } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ApiDiagnostic = () => {
  const [results, setResults] = useState<{[key: string]: string}>({});
  const [isRunning, setIsRunning] = useState(false);

  // Get base URL based on platform and environment
  const getBaseUrl = () => {
    if (Platform.OS === 'android') {
      return __DEV__ ? 'http://10.0.2.2:5263/api' : 'https://api.notewiz.com/api';
    } else {
      return __DEV__ ? 'http://localhost:5263/api' : 'https://api.notewiz.com/api';
    }
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults({});
    
    // Step 1: Check environment
    addResult('Platform', Platform.OS);
    addResult('Development Mode', __DEV__ ? 'Yes' : 'No');
    addResult('API Base URL', getBaseUrl());
    
    // Step 2: Check token
    try {
      const token = await AsyncStorage.getItem('userToken');
      addResult('Token Exists', token ? 'Yes' : 'No');
      if (token) {
        // Test if token is valid with a simple user info request
        try {
          const response = await apiClient.get('/users/me');
          addResult('Valid Token', 'Yes');
          addResult('User ID', response.data.id);
          addResult('Username', response.data.username);
        } catch (error) {
          addResult('Valid Token', 'No - ' + extractErrorMessage(error));
        }
      }
    } catch (error) {
      addResult('Token Check Error', extractErrorMessage(error));
    }
    
    // Step 3: Test API connectivity with a simple ping
    try {
      const startTime = Date.now();
      await apiClient.get('/health'); // Assuming you have a health endpoint
      const endTime = Date.now();
      addResult('API Connectivity', 'Success');
      addResult('Response Time', `${endTime - startTime}ms`);
    } catch (error) {
      addResult('API Connectivity', 'Failed - ' + extractErrorMessage(error));
    }
    
    // Step 4: Test notes endpoint specifically
    try {
      await apiClient.get('/notes');
      addResult('Notes API Access', 'Success');
    } catch (error) {
      addResult('Notes API Access', 'Failed - ' + extractErrorMessage(error));
    }
    
    // Step 5: Test note creation with minimal data
    try {
      const testNote = {
        title: 'Test Note ' + Date.now(),
        content: 'API diagnostic test',
        tags: [],
        color: '#FFFFFF',
        isPinned: false,
        folderId: null
      };
      const response = await apiClient.post('/notes', testNote);
      addResult('Create Note', 'Success - ID: ' + response.data.id);
      
      // Clean up by deleting the test note
      try {
        await apiClient.delete(`/notes/${response.data.id}`);
        addResult('Delete Test Note', 'Success');
      } catch (deleteError) {
        addResult('Delete Test Note', 'Failed - ' + extractErrorMessage(deleteError));
      }
    } catch (error) {
      addResult('Create Note', 'Failed - ' + extractErrorMessage(error));
    }
    
    setIsRunning(false);
  };

  const addResult = (key: string, value: string | number | boolean) => {
    setResults(prev => ({
      ...prev,
      [key]: String(value)
    }));
  };

  const extractErrorMessage = (error: any): string => {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      let message = `Status: ${status}`;
      
      // Try to extract more details
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          message += ` - ${error.response.data}`;
        } else if (error.response.data.message) {
          message += ` - ${error.response.data.message}`;
        } else if (error.response.data.error) {
          message += ` - ${error.response.data.error}`;
        }
      }
      return message;
    } else if (error.request) {
      // Request made but no response
      return 'No response from server. Network error?';
    } else {
      // Error setting up request
      return error.message || 'Unknown error';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Diagnostic Tool</Text>
      
      <Button 
        title={isRunning ? "Running Tests..." : "Run Diagnostics"} 
        onPress={runDiagnostics}
        disabled={isRunning}
      />
      
      <ScrollView style={styles.resultsContainer}>
        {Object.entries(results).map(([key, value]) => (
          <View style={styles.resultRow} key={key}>
            <Text style={styles.resultKey}>{key}:</Text>
            <Text style={styles.resultValue}>{value}</Text>
          </View>
        ))}
        
        {isRunning && <Text style={styles.running}>Running tests...</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  resultsContainer: {
    marginTop: 20
  },
  resultRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8
  },
  resultKey: {
    flex: 1,
    fontWeight: 'bold'
  },
  resultValue: {
    flex: 2
  },
  running: {
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic'
  }
});

export default ApiDiagnostic;