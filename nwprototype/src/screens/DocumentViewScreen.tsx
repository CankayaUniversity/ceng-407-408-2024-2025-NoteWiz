import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import DocumentViewer from '../components/DocumentViewer';

type DocumentViewScreenRouteProp = RouteProp<RootStackParamList, 'DocumentView'>;

interface DocumentViewScreenProps {
  route: DocumentViewScreenRouteProp;
}

const DocumentViewScreen: React.FC<DocumentViewScreenProps> = ({ route }) => {
  const { documentId, title } = route.params;

  return (
    <View style={styles.container}>
      <DocumentViewer documentId={documentId} title={title} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default DocumentViewScreen; 