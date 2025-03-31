import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Animated
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import COLORS from '@/constants/Colors';
import StatusModal from '@/components/StatusModal';
import CustomSwitch from '@/components/CustomSwitch';
import { getData, storeData, removeData } from '@/utils/AsyncStorage';
import { StatusOption } from '@/utils/types';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [status, setStatus] = useState('pedestrian');
  const [modalVisible, setModalVisible] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [scrollY] = useState(new Animated.Value(0));

  const statusOptions: { [key: string]: StatusOption } = {
    pedestrian: { label: 'Pedestrian', icon: 'walking' },
    car: { label: 'On a car', icon: 'car' },

  };
  
  useEffect(() => {
    const loadUserData = async () => {
      // Load status
      const storedStatus = await getData<string>('userStatus');
      if (storedStatus && statusOptions[storedStatus]) {
        setStatus(storedStatus);
      }
      
      // Load location preference
      const locationPref = await getData<boolean>('locationEnabled');
      if (locationPref !== null) {
        setLocationEnabled(locationPref);
      }
    };
    
    loadUserData();
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await storeData('userStatus', newStatus);
    setModalVisible(false);
  };

  const handleLocationToggle = async (value: boolean) => {
    setLocationEnabled(value);
    await storeData('locationEnabled', value);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: async () => {
            // Clear relevant data
            await removeData('userStatus');
            await removeData('locationEnabled');
            // Navigate to login or implement your logout logic
            // navigation.navigate('Login');
            Alert.alert("Logged out successfully");
          },
          style: "destructive"
        }
      ]
    );
  };

  // Animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </Animated.View>
      
      {/* Main Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Profile Header with Avatar and Info */}
        <View style={styles.profileHeader}>
          <Animated.View style={[styles.avatarContainer, { transform: [{ scale: imageScale }] }]}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={[styles.avatar, { width: width * 0.3, height: width * 0.3, borderRadius: width * 0.15 }]}
            />
            <View style={styles.statusBadge}>
              <FontAwesome5 name={statusOptions[status].icon} size={14} color={COLORS.background} />
            </View>
          </Animated.View>
          
          <Text style={styles.name}>Salah eddine</Text>
          <Text style={styles.email}>email@example.com</Text>
          
          {/* Status Button */}
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.statusIconContainer}>
              <FontAwesome5 name={statusOptions[status].icon} size={18} color={COLORS.background} />
            </View>
            <Text style={styles.statusButtonText}>{statusOptions[status].label}</Text>
            <Feather name="chevron-down" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {/* Location Toggle */}
          <CustomSwitch
            label="Enable Location"
            value={locationEnabled}
            onValueChange={handleLocationToggle}
            iconName="location"
            IconComponent={Ionicons}
          />
          
          {/* Other settings can be added here */} 
         <CustomSwitch
            label="Dark Mode"
            value={false}
            onValueChange={() => {}}
            iconName="moon-outline"
            IconComponent={Ionicons}
          />
        </View>
        
        {/* Account Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Feather name="user" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Feather name="shield" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Privacy & Security</Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Feather name="help-circle" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color={COLORS.textOnPrimary} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        {/* App version info */}
        <Text style={styles.versionInfo}>Version 1.0.0</Text>
      </ScrollView>
      
      {/* Status Modal */}
      <StatusModal
        visible={modalVisible}
        status={status}
        statusOptions={statusOptions}
        onStatusChange={handleStatusChange}
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
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor:COLORS.cardBackground,
    zIndex: 1000,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
    marginLeft: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.headerTint,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  email: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  statusIconContainer: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
  },
  settingsSection: {
    marginBottom:12,
    flexDirection: 'column',
    gap:10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
    marginLeft: 10,
  },
  versionInfo: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default ProfileScreen;