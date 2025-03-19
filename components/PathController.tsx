import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Colors from '@/constants/Colors';
import { Point, SelectionMode } from '@/utils/types';
import { LocationObject } from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

interface PathControlsProps {
  startPoint: LocationObject | Point | null;
  endPoint: Point | null;
  onSetSelectionMode: (mode: SelectionMode) => void;
  onFindPath: () => void;
  onResetPath: () => void;
  isLoading: boolean;
  errorMessage: string;
  selectionMode: SelectionMode;
}

const PathControls: React.FC<PathControlsProps> = ({
  startPoint,
  endPoint,
  onSetSelectionMode,
  onFindPath,
  onResetPath,
  isLoading,
  errorMessage,
  selectionMode,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const controlWidth = Math.min(screenWidth * 0.85, 340);
  const topOffset = screenHeight > 800 ? 50 : 30;

  // Helper pour extraire latitude et longitude de startPoint (qu'il soit LocationObject ou Point)
  const getCoords = (point: LocationObject | Point | null) => {
    if (!point) return null;
    if ('coords' in point) {
      return { lat: point.coords.latitude, lng: point.coords.longitude };
    }
    return { lat: point.lat, lng: point.lng };
  };

  const startCoords = getCoords(startPoint);
  const endCoords = endPoint ? { lat: endPoint.lat, lng: endPoint.lng } : null;

  return (
    <View
      style={[
        styles.container,
        {
          width: controlWidth,
          top: topOffset,
          left: (screenWidth - controlWidth) / 2,
        },
      ]}
    >
      <LinearGradient colors={['#ffffff', '#f3f4f6']} style={styles.gradient}>
        <Text style={styles.title}>Path Finder</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => onSetSelectionMode('end')}
            style={[
              styles.button,
              selectionMode === 'end' && styles.buttonActive,
              isLoading && styles.buttonDisabled,
            ]}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {endCoords
                ? `End: (${endCoords.lat.toFixed(2)}, ${endCoords.lng.toFixed(2)})`
                : 'Select End Point'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={onFindPath}
            style={[
              styles.actionButton,
              (isLoading || !startCoords || !endCoords) && styles.buttonDisabled,
            ]}
            disabled={isLoading || !startCoords || !endCoords}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#34d399', '#10b981']} style={styles.actionGradient}>
              <Text style={styles.actionButtonText}>
                {isLoading ? 'Finding...' : 'Find Path'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onResetPath}
            style={[styles.actionButton, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#f87171', '#ef4444']} style={styles.actionGradient}>
              <Text style={styles.actionButtonText}>Reset</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  errorContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
  },
});

export default PathControls;
