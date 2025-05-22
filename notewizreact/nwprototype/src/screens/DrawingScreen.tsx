// src/screens/DrawingScreen.tsx

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  Keyboard,
  Platform,
  PanResponder,
  GestureResponderEvent,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { drawingService } from '../services/drawingService';

// Bizim bileşenler
import { DrawingHeader } from '../components/drawing/DrawingHeader';
import { DrawingToolbar } from '../components/drawing/DrawingToolbar';
import { DrawingTools } from '../components/drawing/DrawingTools';
import { ColorPicker } from '../components/drawing/ColorPicker';

import { COLORS, SHADOWS, SPACING } from '../constants/theme';
import Animated, { useSharedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Çizim stroke yapısı
interface Stroke {
  path: string;
  color: string;
  strokeWidth: number;
}
interface Point {
  x: number;
  y: number;
}

// Metin notu yapısı
interface TextNoteItem {
  id: string;
  content: string;
  x: number;
  y: number;
}

type DrawingScreenRouteProp = RouteProp<RootStackParamList, 'Drawing'>;
type DrawingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Drawing'>;

const DrawingScreen: React.FC = () => {
  const route = useRoute<DrawingScreenRouteProp>();
  const navigation = useNavigation<DrawingScreenNavigationProp>();

  // Çizim ile ilgili state
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const currentPoints = useRef<Point[]>([]);

  // Renk, kalem kalınlığı
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState<number>(3);

  // METİN NOTLARI
  const [textNotes, setTextNotes] = useState<TextNoteItem[]>([]);

  // Hangisini düzenliyoruz?
  const [editingNote, setEditingNote] = useState<TextNoteItem | null>(null);
  // Notu düzenlerken, text'i bu state'te tutuyoruz
  const [tempContent, setTempContent] = useState<string>('');

  // Reanimated shared value (DrawingToolbar için)
  const position = useSharedValue<number>(0);

  // Araç seçimi için state'e 'move' ekle
  const [selectedTool, setSelectedTool] = useState<'pen' | 'highlighter' | 'eraser' | 'move'>('pen');
  const dragOffsetRef = useRef<{ [key: string]: { x: number; y: number } }>({});

  // PanResponder => çizim
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        // Eğer bir metin bloğu sürükleniyorsa çizim PanResponder'ı devreye girmesin
        if (editingNote) return false;
        return true;
      },
      onMoveShouldSetPanResponder: () => {
        if (editingNote) return false;
        return true;
      },

      onPanResponderGrant: (evt: GestureResponderEvent) => {
        currentPoints.current = [];
        const p: Point = {
          x: evt.nativeEvent.locationX,
          y: evt.nativeEvent.locationY,
        };
        currentPoints.current.push(p);
        setCurrentPath(generatePath(currentPoints.current));
      },

      onPanResponderMove: (evt: GestureResponderEvent) => {
        const p: Point = {
          x: evt.nativeEvent.locationX,
          y: evt.nativeEvent.locationY,
        };
        currentPoints.current.push(p);
        setCurrentPath(generatePath(currentPoints.current));
      },

      onPanResponderRelease: () => {
        if (currentPoints.current.length > 0) {
          const finalPath = generatePath(currentPoints.current);
          const newStroke: Stroke = {
            path: finalPath,
            color: selectedColor,
            strokeWidth: selectedStrokeWidth,
          };
          setStrokes((prev) => [...prev, newStroke]);
        }
        currentPoints.current = [];
        setCurrentPath('');
      },
    })
  ).current;

  const generatePath = (points: Point[]) => {
    if (!points.length) return '';
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L${points[i].x},${points[i].y}`;
    }
    return d;
  };

  const canUndo = strokes.length > 0;
  const handleUndo = () => {
    if (canUndo) {
      setStrokes((prev) => prev.slice(0, -1));
    }
  };
  const handleClear = () => {
    setStrokes([]);
    setCurrentPath('');
  };

  // Log noteId for debugging
  useEffect(() => {
    console.log('DrawingScreen noteId:', route.params?.noteId);
    if (!route.params?.noteId) {
      Alert.alert('Error', 'Note ID is missing. Please open a saved note to draw.');
      navigation.goBack();
    }
  }, []);

  // Çizim verilerini kaydet
  const saveDrawingData = async () => {
    try {
      if (!route.params?.noteId) {
        throw new Error('Note ID is required');
      }

      // Çizim verilerini JSON formatına dönüştür
      const drawingData = JSON.stringify({
        strokes,
        canvasWidth: width,
        canvasHeight: height
      });

      // Backend'e kaydet
      await drawingService.saveDrawing(route.params.noteId, drawingData);

      Alert.alert('Success', 'Drawing saved successfully');
    } catch (error) {
      console.error('Error saving drawing:', error);
      Alert.alert('Error', 'Failed to save drawing');
    }
  };

  // Çizim verilerini yükle
  const loadDrawingData = async () => {
    try {
      if (!route.params?.noteId) {
        throw new Error('Note ID is required');
      }

      const drawings = await drawingService.getDrawings(route.params.noteId);
      if (drawings.length > 0) {
        const lastDrawing = drawings[drawings.length - 1];
        const drawingData = JSON.parse(lastDrawing.drawingData);
        setStrokes(drawingData.strokes);
      }
    } catch (error) {
      console.error('Error loading drawing:', error);
    }
  };

  // Component mount olduğunda çizim verilerini yükle
  useEffect(() => {
    loadDrawingData();
  }, []);

  // YENİ NOT EKLE
  const handleAddTextNote = () => {
    // Basit bir konum: Ekranın ortası
    const newNote: TextNoteItem = {
      id: Date.now().toString(),
      content: 'Yeni not',
      x: width / 2 - 50, // ortalarda bir yer
      y: height / 2 - 50,
    };
    setTextNotes((prev) => [...prev, newNote]);
  };

  // Bir not'a tıklayınca "Düzenleme" moduna geçiyoruz
  const handleNotePress = (note: TextNoteItem) => {
    setEditingNote(note);
    setTempContent(note.content);
  };

  // Düzenlemeyi kaydet
  const saveNoteEdits = () => {
    if (!editingNote) return;
    setTextNotes((prev) =>
      prev.map((item) =>
        item.id === editingNote.id ? { ...item, content: tempContent } : item
      )
    );
    setEditingNote(null);
    setTempContent('');
  };

  // Not silme fonksiyonu
  const handleDeleteNote = (noteId: string) => {
    setTextNotes((prev) => prev.filter((item) => item.id !== noteId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <DrawingHeader
        onBack={() => navigation.goBack()}
        onUndo={handleUndo}
        onClear={handleClear}
        onSave={saveDrawingData}
        canUndo={canUndo}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Ana çizim alanı */}
        <View style={styles.drawingArea} {...(selectedTool !== 'move' ? panResponder.panHandlers : {})}>
          <Svg style={StyleSheet.absoluteFill}>
            {strokes.map((stroke, idx) => (
              <Path
                key={idx}
                d={stroke.path}
                stroke={stroke.color}
                strokeWidth={stroke.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentPath !== '' && (
              <Path
                d={currentPath}
                stroke={selectedColor}
                strokeWidth={selectedStrokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>

          {/* Metin notlarını ekranda absolute View olarak göster */}
          {textNotes.map((note) => {
            // Sadece 'move' aracı seçiliyken handle için PanResponder aktif olsun
            const handlePanResponder = selectedTool === 'move'
              ? PanResponder.create({
                  onStartShouldSetPanResponder: () => true,
                  onPanResponderGrant: (evt, gestureState) => {
                    if (evt && evt.persist) evt.persist();
                    if (!evt || !evt.nativeEvent) return;
                    dragOffsetRef.current[note.id] = {
                      x: evt.nativeEvent.locationX,
                      y: evt.nativeEvent.locationY,
                    };
                  },
                  onPanResponderMove: (evt, gestureState) => {
                    if (evt && evt.persist) evt.persist();
                    if (!evt || !evt.nativeEvent) return;
                    const offset = dragOffsetRef.current[note.id] || { x: 0, y: 0 };
                    setTextNotes((prev) =>
                      prev.map((item) =>
                        item.id === note.id
                          ? {
                              ...item,
                              x: evt.nativeEvent.pageX - offset.x,
                              y: evt.nativeEvent.pageY - offset.y - (Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0),
                            }
                          : item
                      )
                    );
                  },
                  onPanResponderRelease: () => {},
                })
              : undefined;

            return (
              <View
                key={note.id}
                style={[
                  styles.noteItem,
                  {
                    left: note.x,
                    top: note.y,
                    minWidth: 80,
                    minHeight: 40,
                    // Genişlik: içeriğe göre ayarlanacak
                    width: Math.max(80, note.content.length * 8 + 24), // 8px/karakter + handle
                  },
                ]}
              >
                {/* Sürükleme alanı sadece el aracı seçiliyken görünür ve aktif olur */}
                {selectedTool === 'move' && (
                  <View
                    style={styles.dragHandle}
                    {...(handlePanResponder ? handlePanResponder.panHandlers : {})}
                  >
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>☰</Text>
                  </View>
                )}
                {/* Silme butonu sadece el aracı seçiliyken sağ üstte görünür */}
                {selectedTool === 'move' && (
                  <TouchableOpacity
                    style={styles.deleteHandle}
                    onPress={() => handleDeleteNote(note.id)}
                  >
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>×</Text>
                  </TouchableOpacity>
                )}
                {/* Metin alanı */}
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: selectedTool === 'move' ? 24 : 0 }}
                  onPress={() => handleNotePress(note)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.noteText}>{note.content}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Tools */}
        <View style={styles.toolsContainer}>
          <DrawingTools
            selectedTool={selectedTool as 'pen' | 'eraser' | 'highlighter'}
            onSelectTool={(tool) => setSelectedTool(tool)}
            strokeWidth={selectedStrokeWidth}
            onStrokeWidthChange={setSelectedStrokeWidth}
          />
          <TouchableOpacity
            style={[styles.moveToolButton, selectedTool === 'move' && { backgroundColor: '#4C6EF5' }]}
            onPress={() => setSelectedTool('move')}
          >
            <Text style={{ color: selectedTool === 'move' ? '#FFF' : '#333', fontSize: 18 }}>🖐️</Text>
          </TouchableOpacity>
          <ColorPicker
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
        </View>

        <DrawingToolbar
          position={position}
          selectedTool={selectedTool as 'pen' | 'eraser' | 'highlighter'}
          onToolSelect={(tool) => setSelectedTool(tool)}
        />

        {/* Metin ekleme butonu */}
        <TouchableOpacity
          style={[styles.fab, { bottom: 140 }]}
          onPress={handleAddTextNote}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+T</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* NOT DÜZENLEME MODAL */}
      <Modal
        visible={editingNote !== null}
        transparent
        animationType="slide"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Not Düzenle</Text>
            <TextInput
              style={[styles.modalInput, { width: Math.max(120, tempContent.length * 8) }]}
              multiline
              value={tempContent}
              onChangeText={setTempContent}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={saveNoteEdits}>
                <Text style={{ color: '#FFF' }}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setEditingNote(null);
                  setTempContent('');
                }}
              >
                <Text style={{ color: '#FFF' }}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DrawingScreen;

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawingArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  toolsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4C6EF5',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  noteItem: {
    position: 'absolute',
    padding: 8,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  dragHandle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: '#EEE',
    borderTopLeftRadius: 8,
  },
  deleteHandle: {
    position: 'absolute',
    right: -18,
    top: -12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: '#F03E3E',
    borderRadius: 12,
    elevation: 2,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1A1A1A',
  },
  modalInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#4C6EF5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  closeButton: {
    backgroundColor: '#868E96',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  moveToolButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
