// screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import COLORS from '@/constants/Colors';
import StatusModal from '@/components/StatusModal';
import { getData } from '@/utils/AsyncStorage';
import {StatusOption} from '@/utils/types';

const ProfileScreen = () => {
  //const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [status, setStatus] = useState('pedestrian');
  const [modalVisible, setModalVisible] = useState(false);

  const statusOptions: { [key: string]: StatusOption } = {
    pedestrian: { label: 'Pedestrian', icon: 'walking' },
    car: { label: 'On a car', icon: 'car' },
  };

  
  useEffect(() => {
    const loadStatus = async () => {
      const storedStatus = await getData<string>('userStatus');
      if (storedStatus && statusOptions[storedStatus]) {
        console.log('Actual Status: ' ,storedStatus);
        setStatus(storedStatus);
      }
    };
    loadStatus();
  }, [status]);

  return (
    <View style={styles.container}>
     
      {/* Profile Content */}
      <View style={styles.profileContent}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={[styles.avatar, { width: width * 0.3, height: width * 0.3, borderRadius: width * 0.15 }]}
        />
        <Text style={styles.name}>Salah eddine </Text>
        <Text style={styles.email}>email@example.com</Text>

        {/* Status Selection */}
        <TouchableOpacity
          style={styles.statusButton}
          onPress={() => setModalVisible(true)}
        >
          <FontAwesome5 name={statusOptions[status].icon} size={20} color={COLORS.primary} />
          <Text style={styles.statusButtonText}>{statusOptions[status].label}</Text>
        </TouchableOpacity>
      </View>

      {/* Status Modal Component */}
      <StatusModal
        visible={modalVisible}
        status={status}
        statusOptions={statusOptions}
        onStatusChange={(newStatus) => setStatus(newStatus)}
        onClose={() => setModalVisible(false)}
        width={width}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  profileContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.textOnPrimary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  statusButtonText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
});

export default ProfileScreen;