import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import Pdf from 'react-native-pdf';
import Svg, { Path } from 'react-native-svg';
import { useRoute, useNavigation } from '@react-navigation/native';
import { drawingService } from '../services/drawingService';

const { width, height } = Dimensions.get('window');

const PdfDrawingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const noteId = route.params?.noteId;
  const [pdfUrl, setPdfUrl] = useState('');
  const [strokes, setStrokes] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000');
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(3);

  useEffect(() => {
    // Notun PDF url'sini backend'den veya context'ten al
    // Burada örnek olarak context veya API'den çekilebilir
    // setPdfUrl(...)
    // Çizimleri yükle
    const load = async () => {
      const drawings = await drawingService.getDrawings(noteId);
      if (drawings.length > 0) {
        const lastDrawing = drawings[drawings.length - 1];
        const drawingData = JSON.parse(lastDrawing.drawingData);
        setStrokes(drawingData.strokes);
      }
    };
    load();
  }, [noteId]);

  // Çizim işlemleri (PanResponder veya benzeri eklenebilir)
  // ...

  const saveDrawingData = async () => {
    try {
      const drawingData = JSON.stringify({ strokes, canvasWidth: width, canvasHeight: height });
      await drawingService.saveDrawing(noteId, drawingData);
      Alert.alert('Başarılı', 'Çizim kaydedildi');
    } catch (e) {
      Alert.alert('Hata', 'Çizim kaydedilemedi');
    }
  };

  return (
    <View style={styles.container}>
      <Pdf source={{ uri: pdfUrl }} style={styles.pdf} />
      <Svg style={styles.drawingLayer} pointerEvents="box-none">
        {strokes.map((stroke, idx) => (
          <Path key={idx} d={stroke.path} stroke={stroke.color} strokeWidth={stroke.strokeWidth} fill="none" />
        ))}
        {currentPath !== '' && (
          <Path d={currentPath} stroke={selectedColor} strokeWidth={selectedStrokeWidth} fill="none" />
        )}
      </Svg>
      <TouchableOpacity style={styles.saveBtn} onPress={saveDrawingData}>
        <Text style={{ color: '#fff' }}>Çizimi Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pdf: { flex: 1 },
  drawingLayer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: width,
    height: height,
  },
  saveBtn: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#4C6EF5',
    borderRadius: 8,
    padding: 14,
    zIndex: 10,
  },
});

export default PdfDrawingScreen; 