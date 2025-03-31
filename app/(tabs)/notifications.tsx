import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Image, 
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Notification } from '@/utils/types';
import Colors from '@/constants/Colors';
import { ColorProperties } from 'react-native-reanimated/lib/typescript/Colors';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock fetch function to simulate API call
  const fetchNotifications = async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Example notifications data - replace with actual API call
    
    setNotifications([]);
    setLoading(false);
    setRefreshing(false);
  };

  // Refresh handler for pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Update current time every 5 minutes to refresh relative time displays
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Format the date as relative time
  const formatRelativeTime = (date: Date) => {
    const now = currentTime;
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 30) {
      return 'now';
    } else if (diffMin < 1) {
      return `${diffSec} sec ago`;
    } else if (diffMin < 60) {
      return diffMin === 1 ? '1 min ago' : `${diffMin} mins ago`;
    } else if (diffHour < 24) {
      return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
    } else if (diffDay < 7) {
      return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    } else {
      // More than a week ago
      return date.toLocaleDateString();
    }
  };

  // Render each notification item
  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity style={[styles.notificationCard, !item.seen && styles.unreadCard]}>
      {!item.seen && <View style={styles.unreadDot} />}
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>
        <Text style={styles.notificationDate}>{formatRelativeTime(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  // Empty state component when there are no notifications
  const EmptyNotifications = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={{ uri: 'https://via.placeholder.com/200' }} 
        style={styles.emptyImage}
      />
      <Text style={styles.emptyTitle}>No Notifications Yet</Text>
      <Text style={styles.emptyDescription}>
        We'll notify you when something important happens
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Notifications</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.notificationsList}
          ListEmptyComponent={EmptyNotifications}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.secondary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  notificationsList: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  unreadCard: {
    backgroundColor: '#f0f6ff',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4880ff',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1a1a1a',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: 12,
    color: '#9e9e9e',
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#616161',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#9e9e9e',
    textAlign: 'center',
    maxWidth: '80%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color:Colors.textSecondary
  },
});

export default Notifications;