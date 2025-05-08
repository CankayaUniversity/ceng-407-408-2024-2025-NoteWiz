import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/theme';
import { TYPOGRAPHY } from '../constants/theme';

interface DocumentViewerProps {
  documentId: string;
  title: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId, title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.documentId}>Document ID: {documentId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background.paper,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 32,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  documentId: {
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 24,
    color: COLORS.text.secondary,
  },
});

export default DocumentViewer; 