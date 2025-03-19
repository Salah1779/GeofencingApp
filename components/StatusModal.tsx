// components/StatusModal.tsx
import React from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import COLORS from '@/constants/Colors';
import { storeData } from '@/utils/AsyncStorage'; 
import {StatusOption} from '@/utils/types';



interface StatusModalProps {
  visible: boolean;
  status: string;
  statusOptions: { [key: string]: StatusOption };
  onStatusChange: (status: string) => void;
  onClose: () => void;
  width: number; // Window width for responsive sizing
}

const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  status,
  statusOptions,
  onStatusChange,
  onClose,
  width,
}) => {
  const handleStatusChange = async (newStatus: string) => {
    try {
      await storeData('userStatus', newStatus); // Store the status in AsyncStorage
      onStatusChange(newStatus); // Update parent state
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error storing status:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { width: width * 0.8 }]}>
          <Text style={styles.modalTitle}>Select Status</Text>
          {Object.entries(statusOptions).map(([key, { label, icon }]) => (
            <Pressable
              key={key}
              style={[styles.statusOption , key === status && styles.statusOptionSelected]}
              onPress={() => handleStatusChange(key)}
            >
              <FontAwesome5 name={icon} size={20} color={key=== status ? COLORS.textOnPrimary : COLORS.primary}  />
              <Text style={[styles.statusText, key === status && styles.statusTextSelected]}>{label}</Text>
            </Pressable>
          ))}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.textSecondary,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  statusOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  statusText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  statusTextSelected: {
    color: COLORS.textOnPrimary,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 15,
  },
  closeButtonText: {
    color: COLORS.primary,
    fontSize: 16,
  },
});

export default StatusModal;