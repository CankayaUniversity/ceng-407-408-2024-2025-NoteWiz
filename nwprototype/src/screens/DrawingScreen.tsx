// src/screens/DrawingScreen.tsx

import React, { useRef, useState } from 'react';
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

// Bizim bileşenler
import { DrawingHeader } from '../components/drawing/DrawingHeader';
import { DrawingToolbar } from '../components/drawing/DrawingToolbar';
import { DrawingTools } from '../components/drawing/DrawingTools';
import { ColorPicker } from '../components/drawing/ColorPicker';

// AI fonksiyonlarımız
import { getSummary, rewriteText } from '../services/openai';

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
  aiResponses: string[];
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

  // PanResponder => çizim
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

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
  const handleSave = () => {
    // strokes + textNotes DB'ye kaydedebilirsiniz
    navigation.goBack();
  };

  // YENİ NOT EKLE
  const handleAddTextNote = () => {
    // Basit bir konum: Ekranın ortası
    const newNote: TextNoteItem = {
      id: Date.now().toString(),
      content: 'Yeni not',
      x: width / 2 - 50, // ortalarda bir yer
      y: height / 2 - 50,
      aiResponses: [],
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

  // AI ÖZET
  const handleAISummary = async () => {
    if (!editingNote) return;
    try {
      if (!tempContent.trim()) {
        Alert.alert('Uyarı', 'Not içeriği boş');
        return;
      }
      const summary = await getSummary(tempContent);
      if (summary) {
        // Bu summary'i notun aiResponses dizisine ekliyoruz
        setTextNotes((prev) =>
          prev.map((item) => {
            if (item.id === editingNote.id) {
              return {
                ...item,
                aiResponses: [...item.aiResponses, `Özet:\n${summary}`],
              };
            }
            return item;
          })
        );
        Alert.alert('AI', 'Özet eklendi, notun altına kaydedildi.');
      } else {
        Alert.alert('AI', 'Özet boş döndü.');
      }
    } catch (error) {
      console.error('AI error:', error);
      Alert.alert('Hata', 'AI isteğinde hata oluştu.');
    }
  };

  // Diğer AI özelliği (örnek: rewrite)
  const handleAIRewrite = async () => {
    if (!editingNote) return;
    try {
      if (!tempContent.trim()) {
        Alert.alert('Uyarı', 'Not içeriği boş');
        return;
      }
      const result = await rewriteText(tempContent);
      if (result) {
        // Bunu da aiResponses dizisine ekleyelim
        setTextNotes((prev) =>
          prev.map((item) => {
            if (item.id === editingNote.id) {
              return {
                ...item,
                aiResponses: [...item.aiResponses, `Rewrite:\n${result}`],
              };
            }
            return item;
          })
        );
        Alert.alert('AI', 'Rewrite sonucu eklendi.');
      } else {
        Alert.alert('AI', 'Rewrite boş döndü.');
      }
    } catch (error) {
      console.error('AI rewrite error:', error);
      Alert.alert('Hata', 'AI rewrite isteğinde hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <DrawingHeader
        onBack={() => navigation.goBack()}
        onUndo={handleUndo}
        onClear={handleClear}
        onSave={handleSave}
        canUndo={canUndo}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Ana çizim alanı */}
        <View style={styles.drawingArea} {...panResponder.panHandlers}>
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
          {textNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={[
                styles.noteItem,
                {
                  left: note.x,
                  top: note.y,
                },
              ]}
              onPress={() => handleNotePress(note)}
              activeOpacity={0.8}
            >
              <Text style={styles.noteText}>{note.content}</Text>
              {/* AI cevaplarını da altına koyabiliriz */}
              {note.aiResponses.map((resp, i) => (
                <Text key={i} style={styles.aiResponse}>
                  {resp}
                </Text>
              ))}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tools */}
        <View style={styles.toolsContainer}>
          <DrawingTools
            selectedTool="pen"
            onSelectTool={() => {}}
            strokeWidth={selectedStrokeWidth}
            onStrokeWidthChange={setSelectedStrokeWidth}
          />
          <ColorPicker
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
        </View>

        <DrawingToolbar
          position={position}
          selectedTool="pen"
          onToolSelect={() => {}}
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
            <Text style={styles.modalTitle}>Not Düzenle / AI</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              value={tempContent}
              onChangeText={setTempContent}
            />
            <ScrollView horizontal style={{ marginVertical: 8 }}>
              <TouchableOpacity style={styles.aiButton} onPress={handleAISummary}>
                <Text style={styles.aiButtonText}>Özetle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aiButton} onPress={handleAIRewrite}>
                <Text style={styles.aiButtonText}>Rewrite</Text>
              </TouchableOpacity>
            </ScrollView>

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
    minWidth: 80,
    minHeight: 40,
    padding: 8,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    ...SHADOWS.xs,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
  },
  aiResponse: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 2,
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
  aiButton: {
    backgroundColor: '#12B886',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    marginTop: 8,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
});
