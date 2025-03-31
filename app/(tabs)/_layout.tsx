import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import TabBar from '@/components/TabBar';

import Colors from '@/constants/Colors';


export default function TabLayout() {
  

  return (
    <Tabs
      tabBar={(props) => (
        <TabBar {...props} />
      )}
    >
      
       

      {/* Profile Tab (Left) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false
         }} // For accessibility and header
         

      />

      {/* Home Tab (Middle) */}
      <Tabs.Screen
        name="index"
        options={{
          title : "Home",
          headerShown: false, // Hide header for Home tab
         
        }}
      />

      {/* Notifications Tab (Right) */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerShown: false, 
        }}
      />
    </Tabs>
  );
}

// Styles using StyleSheet
