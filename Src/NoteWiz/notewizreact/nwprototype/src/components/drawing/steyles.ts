// src/components/drawing/styles.ts
import { Platform, StyleSheet } from "react-native";

// Styles for all drawing components
const styles = StyleSheet.create({
    // DrawingHeader styles
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    button: {
      padding: 8,
      borderRadius: 8,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    saveButton: {
      backgroundColor: '#4C6EF5',
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  
    // DrawingTools styles
    toolsContainer: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1A1A1A',
      marginBottom: 16,
    },
    toolRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    toolButton: {
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      backgroundColor: '#F8F9FA',
      width: 80,
    },
    toolButtonActive: {
      backgroundColor: '#EDF2FF',
    },
    toolText: {
      fontSize: 12,
      color: '#666666',
      marginTop: 4,
    },
    toolTextActive: {
      color: '#4C6EF5',
      fontWeight: '500',
    },
    sliderContainer: {
      marginBottom: 24,
    },
    sliderLabel: {
      fontSize: 14,
      color: '#666666',
      marginBottom: 8,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    sliderValues: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    sliderValueText: {
      fontSize: 12,
      color: '#999999',
    },
  
    // ColorPicker styles
    colorPickerContainer: {
      padding: 16,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      paddingVertical: 8,
    },
    colorButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      margin: 4,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    whiteColorButton: {
      borderWidth: 1,
      borderColor: '#E5E5E5',
    },
    selectedColorButton: {
      borderWidth: 3,
      borderColor: '#4C6EF5',
    },
  
    // DrawingToolbar styles
    toolbarContainer: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      borderRadius: 28,
      padding: 4,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    toolbarButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toolbarButtonActive: {
      backgroundColor: '#EDF2FF',
    },
    toolbarButtonIcon: {
      width: 24,
      height: 24,
    },
    toolbarDivider: {
      width: 1,
      height: 24,
      backgroundColor: '#E5E5E5',
      marginHorizontal: 4,
      alignSelf: 'center',
    },
  });
  
  export default styles;