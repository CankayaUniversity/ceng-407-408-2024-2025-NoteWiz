import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import Pdf from 'react-native-pdf';
import { useRoute } from '@react-navigation/native';

const PdfViewerScreen = () => {
  const route = useRoute();
  const pdfUrl = (route.params as any)?.pdfUrl;

  return (
    <View style={styles.container}>
      {!pdfUrl ? (
        <Text style={{ color: 'red', margin: 24 }}>PDF bağlantısı bulunamadı veya geçersiz!</Text>
      ) : (
        <Pdf
          source={{ uri: pdfUrl }}
          style={styles.pdf}
          renderActivityIndicator={() => <ActivityIndicator size="large" style={{ marginTop: 40 }} />}
          onError={error => {
            console.log('PDF yükleme hatası:', error);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  pdf: { flex: 1, width: '100%' },
});

export default PdfViewerScreen; 