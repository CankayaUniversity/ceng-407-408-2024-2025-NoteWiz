// src/components/drawing/TextNoteItem.tsx

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { SHADOWS } from '../../constants/theme';

export interface TextNote {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aiResponses: string[];
  showAI: boolean; // AI cevapları açık/kapalı
}

interface Props {
  note: TextNote;
  onPress: (note: TextNote) => void;       // Düzenleme paneli açmak için
  onUpdateNote: (noteId: string, data: Partial<TextNote>) => void; // Koordinat/ebat güncelleme
  onToggleAI: (noteId: string) => void;   // AI cevaplarını aç/kapa
}

const TextNoteItem: React.FC<Props> = ({
  note,
  onPress,
  onUpdateNote,
  onToggleAI,
}) => {
  const lastOffset = useRef({ x: note.x, y: note.y });
  const lastSize = useRef({ w: note.width, h: note.height });
  const resizing = useRef(false); // "resize" mi yapıyoruz, "drag" mi ayıralım?

  // DRAG + RESIZE PanResponder
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (
        evt: GestureResponderEvent,
        gesture: PanResponderGestureState
      ) => {
        // Kullanıcı sağ alt köşeye mi dokundu? Oradan anlayıp resizing = true yapabiliriz
        const touchX = evt.nativeEvent.locationX;
        const touchY = evt.nativeEvent.locationY;

        // Basit kontrol: Sağ alt köşeye (20x20 px) tıklanmış mı?
        if (
          touchX > note.width - 20 &&
          touchY > note.height - 20
        ) {
          resizing.current = true;
        } else {
          resizing.current = false;
        }

        lastOffset.current = { x: note.x, y: note.y };
        lastSize.current = { w: note.width, h: note.height };
      },

      onPanResponderMove: (
        evt: GestureResponderEvent,
        gesture: PanResponderGestureState
      ) => {
        if (resizing.current) {
          // Boyutlandırma
          const newWidth = lastSize.current.w + gesture.dx;
          const newHeight = lastSize.current.h + gesture.dy;
          onUpdateNote(note.id, {
            width: Math.max(60, newWidth),   // min 60 px
            height: Math.max(40, newHeight), // min 40 px
          });
        } else {
          // Taşıma (drag)
          const newX = lastOffset.current.x + gesture.dx;
          const newY = lastOffset.current.y + gesture.dy;
          onUpdateNote(note.id, {
            x: newX,
            y: newY,
          });
        }
      },

      onPanResponderRelease: () => {
        resizing.current = false;
      },
    })
  ).current;

  return (
    <View
      style={[
        styles.noteContainer,
        {
          left: note.x,
          top: note.y,
          width: note.width,
          height: note.height,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* İç kısım */}
      <TouchableOpacity
        style={styles.innerTouchable}
        activeOpacity={0.9}
        onPress={() => onPress(note)}
      >
        <Text
          style={styles.noteText}
          numberOfLines={5} // max 5 satır
          ellipsizeMode="tail"
        >
          {note.content}
        </Text>

        {/* AI Cevaplarını açma/kapama butonu */}
        <TouchableOpacity
          onPress={() => onToggleAI(note.id)}
          style={styles.toggleAIButton}
        >
          <Text style={styles.toggleAIButtonText}>
            {note.showAI ? 'Hide AI' : 'Show AI'}
          </Text>
        </TouchableOpacity>

        {/* AI Cevapları */}
        {note.showAI && (
          <View style={styles.aiContainer}>
            {note.aiResponses.map((resp, i) => (
              <Text key={i} style={styles.aiText}>
                {resp}
              </Text>
            ))}
          </View>
        )}

        {/* Sağ alt köşede "resize" handle */}
        <View style={styles.resizeHandle} />
      </TouchableOpacity>
    </View>
  );
};

export default TextNoteItem;

const styles = StyleSheet.create({
  noteContainer: {
    position: 'absolute',
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    ...SHADOWS.xs,
    overflow: 'hidden',
  },
  innerTouchable: {
    flex: 1,
    padding: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },
  toggleAIButton: {
    marginTop: 6,
    alignSelf: 'flex-end',
    backgroundColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toggleAIButtonText: {
    fontSize: 12,
    color: '#000',
  },
  aiContainer: {
    marginTop: 4,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
    padding: 4,
    maxHeight: 100, // scroll vs. istersen
  },
  aiText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resizeHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#ADB5BD',
    borderTopLeftRadius: 8,
  },
});
