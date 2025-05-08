import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { uploadDocument } from '../services/documentService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { COLORS } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DocumentUploadScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      setIsLoading(true);
      await uploadDocument(title, null as any);
      Alert.alert('Success', 'Document uploaded successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="Enter document title"
      />
      <Button
        title="Upload"
        onPress={handleUpload}
        loading={isLoading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background.paper,
  },
  button: {
    marginTop: 16,
  },
});

export default DocumentUploadScreen; 