import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useShares } from '../contexts/ShareContext';
import { colors, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { StarIcon, TaskIcon as EditIcon, CloseIcon as DeleteIcon } from '../components/icons';
import { useNotes } from '../contexts/NoteContext';
import { Note } from '../contexts/NoteContext';
import { COLORS } from '../constants/theme';

type SharedNotesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SharedNotes'>;

const SharedNotesScreen = () => {
  const navigation = useNavigation<SharedNotesScreenNavigationProp>();
  const { sharedNotes, loading, error, loadSharedNotes, updateSharePermission, removeShare } = useShares();
  const { updateNoteCover } = useNotes();
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  useEffect(() => {
    loadSharedNotes();
  }, []);

  const handleUpdatePermission = (shareId: number, currentPermission: boolean) => {
    Alert.alert(
      'İzinleri Güncelle',
      'Bu kullanıcının izinlerini değiştirmek istiyor musunuz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: currentPermission ? 'Salt Okunur Yap' : 'Düzenleme İzni Ver',
          onPress: async () => {
            try {
              await updateSharePermission(shareId, !currentPermission);
              loadSharedNotes(); // Listeyi yenile
            } catch (err) {
              console.error('Error updating permission:', err);
              Alert.alert('Hata', 'İzinler güncellenirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleRemoveShare = (shareId: number) => {
    Alert.alert(
      'Paylaşımı Kaldır',
      'Bu paylaşımı kaldırmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeShare(shareId);
              loadSharedNotes(); // Listeyi yenile
            } catch (err) {
              console.error('Error removing share:', err);
              Alert.alert('Hata', 'Paylaşım kaldırılırken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleCoverSelect = (noteItem: Note | null, coverId: string) => {
    if (!noteItem) return;
    
    if (coverId === 'none') {
      updateNoteCover(noteItem.id, { color: undefined });
    } else {
      // ... diğer cover seçim mantığı
    }
  };

  const handleFolderPress = (folderId: string | number, folderTitle: string) => {
    setCurrentFolder(folderId.toString());
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => navigation.navigate('NoteDetail', {
          noteId: item.id.toString(),
          title: item.title,
          content: item.content,
          category: item.category,
          isImportant: item.isPinned || false,
          color: item.categoryObj?.color,
          folderId: item.folderId ? item.folderId.toString() : null
        })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.noteTitle}>{item.note?.title || 'Başlıksız Not'}</Text>
          <Text style={styles.sharedDate}>
            {new Date(item.sharedAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <StarIcon size={16} color={colors.primary} />
          <Text style={styles.userName}>
            {item.sharedWithUser.fullName}
          </Text>
          <Text style={[
            styles.permissionBadge,
            { backgroundColor: item.canEdit ? colors.success : colors.warning }
          ]}>
            {item.canEdit ? 'Düzenleyebilir' : 'Salt Okunur'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUpdatePermission(item.id, item.canEdit)}
        >
          <EditIcon size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRemoveShare(item.id)}
        >
          <DeleteIcon size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={sharedNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <StarIcon size={48} color={colors.gray[500]} />
            <Text style={styles.emptyText}>Henüz paylaşılan not bulunmuyor</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: SPACING.md,
    backgroundColor: colors.danger,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.error.main,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: 'bold',
    lineHeight: 20,
  } satisfies TextStyle,
  listContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  noteTitle: {
    ...TYPOGRAPHY.h3,
    color: colors.dark,
    flex: 1,
    fontWeight: '700',
  } satisfies TextStyle,
  sharedDate: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '400',
    lineHeight: 18,
  } satisfies TextStyle,
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  userName: {
    ...TYPOGRAPHY.body2,
    color: colors.gray[700],
    marginLeft: SPACING.xs,
    flex: 1,
    fontWeight: "400",
  } satisfies TextStyle,
  permissionBadge: {
    ...TYPOGRAPHY.caption,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    overflow: 'hidden',
  } as TextStyle,
  cardActions: {
    flexDirection: 'row', 
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    padding: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: colors.gray[500],
    marginTop: SPACING.md,
    textAlign: 'center',
  } as TextStyle,
});

export default SharedNotesScreen;