import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { SelectedState, SelectedTypesState } from '@/utils/types';

interface SidebarProps {
  selected: SelectedState;
  selectedTypes: SelectedTypesState;
  uniqueBuildingTypes: string[];
  uniqueRouteTypes: string[];
  uniqueZoneTypes: string[];
  uniqueTrafficTypes: string[];
  toggleCategory: (category: keyof SelectedState) => void;
  toggleType: (category: keyof SelectedTypesState, type: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selected,
  selectedTypes,
  uniqueBuildingTypes,
  uniqueRouteTypes,
  uniqueZoneTypes,
  uniqueTrafficTypes,
  toggleCategory,
  toggleType,
  isOpen,
  onToggle,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({
    buildings: false,
    routes: false,
    zones: false,
    trafficLights: false,
  });

  // Animation setup
  const sidebarAnim = useRef(new Animated.Value(-256)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const maxWidth = Math.min(screenWidth * 0.8, 280);

  // Animate sidebar based on isOpen prop
  useEffect(() => {
    Animated.parallel([
      Animated.timing(sidebarAnim, {
        toValue: isOpen ? 0 : -maxWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: isOpen ? maxWidth : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: isOpen ? 0.5 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen, maxWidth]);

  const toggleCategoryDropdown = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev?.[category],
    }));
  };

  const categoryIcons = {
    buildings: <Feather name="home" size={24} color={Colors.accent} />,
    routes: <Feather name="map" size={24} color={Colors.accent} />,
    zones: <Ionicons name="shield-outline" size={24} color={Colors.accent} />,
    trafficLights: <FontAwesome5 name="traffic-light" size={22} color={Colors.accent} />,
  };

  const getEmoji = (category: keyof SelectedTypesState, type: string) => {
    // Return fun emoji based on type
    if (category === 'buildings') {
      if (type.toLowerCase().includes('residential')) return '🏘️';
      if (type.toLowerCase().includes('commercial')) return '🏢';
      if (type.toLowerCase().includes('industrial')) return '🏭';
      return '🏗️';
    }
    if (category === 'routes') {
      if (type.toLowerCase().includes('highway')) return '🛣️';
      if (type.toLowerCase().includes('street')) return '🚗';
      if (type.toLowerCase().includes('path')) return '🚶';
      return '🚦';
    }
    if (category === 'zones') {
      if (type.toLowerCase().includes('residential')) return '🏡';
      if (type.toLowerCase().includes('commercial')) return '🛍️';
      if (type.toLowerCase().includes('park')) return '🌳';
      return '📍';
    }
    if (category === 'trafficLights') {
      if (type.toLowerCase().includes('signal')) return '🚦';
      if (type.toLowerCase().includes('stop')) return '🛑';
      return '🚥';
    }
    return '✨';
  };

  return (
    <>
      {/* Toggle Button that follows sidebar animation */}
      <Animated.View
        style={[
          styles.toggleButtonContainer,
          {
            transform: [{ translateX: buttonAnim }],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleIcon}>{isOpen ? '✕' : '☰'}</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.sidebar,
          {
            width: maxWidth,
            transform: [{ translateX: sidebarAnim }],
          },
        ]}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Map Layers</Text>
          
          {(['buildings', 'routes', 'zones', 'trafficLights'] as (keyof SelectedState)[]).map(
            (category) => (
              <Animated.View key={category} style={styles.categoryContainer}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => toggleCategoryDropdown(category)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <View style={styles.iconContainer}>{categoryIcons[category]}</View>
                    <Text style={styles.categoryText}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </View>
                  <Animated.View>
                    <MaterialIcons
                      name={expandedCategories[category] ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
                      size={24}
                      color={Colors.textPrimary}
                    />
                  </Animated.View>
                </TouchableOpacity>
                
                {expandedCategories[category] && (
                  <View style={styles.subcategoryContainer}>
                    <TouchableOpacity
                      style={[
                        styles.selectAllButton,
                        selected[category] && styles.selectedButton,
                      ]}
                      onPress={() => toggleCategory(category)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.selectAllText,
                        selected[category] && styles.selectedText
                      ]}>
                        {selected[category] ? 'Unselect All' : 'Select All'}
                      </Text>
                      <MaterialIcons
                        name={selected[category] ? 'done-all' : 'select-all'}
                        size={20}
                        color={selected[category] ? Colors.textOnPrimary : Colors.textSecondary}
                      />
                    </TouchableOpacity>
                    
                    {(category === 'buildings'
                      ? uniqueBuildingTypes
                      : category === 'routes'
                      ? uniqueRouteTypes
                      : category === 'zones'
                      ? uniqueZoneTypes
                      : uniqueTrafficTypes
                    ).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeItem,
                          selectedTypes[category].includes(type) && styles.selectedTypeItem,
                        ]}
                        onPress={() => toggleType(category, type)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.typeEmoji,
                          selectedTypes[category].includes(type) && styles.selectedTypeText
                        ]}>
                          {getEmoji(category, type)}
                        </Text>
                        <Text style={[
                          styles.typeText,
                          selectedTypes[category].includes(type) && styles.selectedTypeText
                        ]}>
                          {type}
                        </Text>
                        <View style={[
                          styles.indicator,
                          selectedTypes[category].includes(type) && styles.selectedIndicator
                        ]}>
                          {selectedTypes[category].includes(type) && (
                            <MaterialIcons name="visibility" size={16} color={Colors.textOnPrimary} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Animated.View>
            )
          )}
        </ScrollView>
      </Animated.View>
      
      {isOpen && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableWithoutFeedback onPress={onToggle}>
            <View style={styles.overlayTouchable} />
          </TouchableWithoutFeedback>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#1F2937', // Dark blue-gray
    zIndex: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  categoryContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2D3748', // Slightly lighter blue-gray
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  subcategoryContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  selectAllButton: {
    backgroundColor: '#3B4C69',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4338CA', // Indigo
  },
  selectAllText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#374151', // Slate
  },
  selectedTypeItem: {
    backgroundColor: '#065F46', // Emerald
  },
  typeEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  typeText: {
    fontSize: 14,
    color: '#E5E7EB',
    flex: 1,
  },
  selectedTypeText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicator: {
    backgroundColor: '#10B981', // Emerald
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  overlayTouchable: {
    flex: 1,
  },
  toggleButtonContainer: {
    position: 'absolute',
    left: 0,
    top: 40,
    zIndex: 30,
  },
  toggleButton: {
    width: 48,
    height: 48,
    borderRadius: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  toggleIcon: {
    fontSize: 24,
    color: Colors.textOnPrimary,
    fontWeight: 'bold',
  },
});

export default Sidebar;