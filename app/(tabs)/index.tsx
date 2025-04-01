import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import axios from 'axios';
import RBush from 'rbush';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { polygon, point } from '@turf/helpers';
import * as Location from 'expo-location';
import Colors from '@/constants/Colors';
import MapComponent from '@/components/mapComponent';
import { configureNotifications, sendNotification } from '@/utils/notificationService';
import {
  EXPO_PUBLIC_ZONES_API, 
  EXPO_PUBLIC_NOTIFICATIONS_GENERATE,
 EXPO_PUBLIC_RISK_API
} from '@/constants/endpoints';
import {
  User,
  Building,
  Route,
  Zone,
  TrafficLight,
  SelectedState,
  SelectedTypesState,
  Point,
  SelectionMode,
  BoundingBox,
} from '@/utils/types';
import useLocationPermission from '@/hooks/useLocationPermission';
import useNotificationPermission from '@/hooks/useNotificationPermission';
import { getData , storeData } from '@/utils/AsyncStorage';
import { getCurrentStatus } from '@/utils/helpers';



const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [allZones, setAllZones] = useState<Zone[]>([]);
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([]);
  const [selected, setSelected] = useState<SelectedState>({
    buildings: false,
    routes: false,
    zones: false,
    trafficLights: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [path, setPath] = useState<any[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<SelectedTypesState>({
    buildings: [],
    routes: [],
    zones: [],
    trafficLights: [],
  });
  const [simulatedLocation, setSimulatedLocation] = useState<Point | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');

  const { locationPermissionGranted, userLocation } = useLocationPermission();
  const { notificationPermissionGranted } = useNotificationPermission();


  const zonesRef = useRef(zones);
  const rtree = useRef(new RBush());
  const lastCheckTime = useRef(0);
  const checkInterval = 5000;



  useEffect(() => {
    configureNotifications(); 
  }, []);


useEffect(() => {
  const getUserFromStorage = async () => {
    const storedUser = await getData<User>('user');
    setUser(storedUser ?? null);
  };


  const user : User = {
    userId: 1,
    email: "example@gmail.com",
    first_name: 'Salaheddine',
    last_name: 'Elbouazaoui',
    token:""

  }
  storeData('user', user);
  getUserFromStorage();
}, []);

useEffect(() => {
  zonesRef.current = zones;
}, [zones]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const [zonesRes]= await Promise.all([
       
        axios.get(EXPO_PUBLIC_ZONES_API),
 
      ]);

      const fetchedZones = zonesRes.data.processedZones;
      
      setAllZones(fetchedZones);
     
    
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  fetchData();
  
}, []);

// Risk calculation
  const fetchRiskCalculation = async () => {
    if(zones.length === 0) return;
    try {
      const response = await axios.post(EXPO_PUBLIC_RISK_API, {
        zone_ids: zones.map((zone) => zone.zoneId),
      });
      const zoneRisks : any[] = response.data.risks;
      const riskMappedZones = zones.map((zone) => {
        const matchedRisk = zoneRisks.find(risk => risk.zoneId === zone.zoneId);
        return {
          ...zone,
          currentRisk_car: matchedRisk ? matchedRisk.risk : 'none',
          currentRisk_pedestrian: matchedRisk ? matchedRisk.risk : 'none',
        };
      });
      setZones(riskMappedZones);
    } catch (error) {
      console.error('Error fetching risk calculation:', error);
    }
  };
// Risk calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRiskCalculation();
    }, 60000);
    return () => clearTimeout(timer);
  }, [zones]);

  // Build R-tree and filter nearby zones
  useEffect(() => {
    rtree.current.clear();
    allZones.forEach((zone) => {
      const bbox ={
        minX: zone.bounding_box.minLon,
        minY: zone.bounding_box.minLat,
        maxX: zone.bounding_box.maxLon,
        maxY: zone.bounding_box.maxLat
      }
      
      rtree.current.insert({ ...bbox, zoneId: zone.zoneId });
    });
    
    const currentLoc = isSimulationMode ? simulatedLocation : userLocation;
    
    if (currentLoc) {
      const nearbyZones = getNearbyZones(currentLoc, allZones);
      setZones(nearbyZones);
    
    } else {
      console.log('No current location available for filtering zones');
    }
  }, [allZones, simulatedLocation, userLocation, isSimulationMode]);


  // Real location tracking
  useEffect(() => {
    if (!locationPermissionGranted || isSimulationMode) return;

    let subscription: Location.LocationSubscription | null = null;
    const startWatching = async () => {
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (loc) => {
          console.log('Real Location Update:', {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
          handleLocationUpdate(loc);
        }
      );
    };
    startWatching();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [locationPermissionGranted, isSimulationMode]);

  
  // Haversine formula for distance (in kilometers)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

// Filter nearby zones
  const getNearbyZones = (location: any, zones: Zone[]): Zone[] => {
    if (!location) return zones;
    const lat = 'coords' in location ? location.coords.latitude : location.lat;
    const lon = 'coords' in location ? location.coords.longitude : location.lng;

    const nearby = zones.filter((zone) => {
      const centroid = getZoneCentroid(zone.geometry);
      const distance = getDistance(lat, lon, centroid.lat, centroid.lon);
      return distance <= 1 ;
    });
    return nearby;
  };

  // Calculate zone centroid
  const getZoneCentroid = (geometry: any): { lat: number; lon: number } => {
    let latSum = 0,
      lonSum = 0,
      count = 0;
    geometry.forEach((point: any) => {
      const lon = point.lon;
      const lat = point.lat;
      if (lon !== undefined && lat !== undefined) {
        latSum += lat;
        lonSum += lon;
        count++;
      }
    });
    return { lat: latSum / count, lon: lonSum / count };
  };

// Generate Notification
  const generateNotification = async (zone: Zone, user : User |null, currentStatus: 'entering' | 'leaving' , activity: string| null) => {
    try {
      const response = await axios.post(EXPO_PUBLIC_NOTIFICATIONS_GENERATE, {
         type: zone.type,
         currentRisk: "Elevee",
         status: currentStatus,
         userContext: {
          name: user?.first_name ?? "Mock",
          user_id : user?.userId
        },
        activity: activity,
      });
      if(response.status === 200){
        
        sendNotification(response.data.newNotification);
      }
      
    } catch (error) {
      console.error('Error generating notification:', error);
    }
  };

  // Handle location update
const handleLocationUpdate = async(location: any) => {
  const now = Date.now();
  if (now - lastCheckTime.current < checkInterval) return;
  lastCheckTime.current = now;

  const lon = location.coords?.longitude ?? location.lng;
  const lat = location.coords?.latitude ?? location.lat;
  const turfPoint = point([lon, lat]);

  let newZone: Zone | null = null;
  for (const zone of zones) {
    if (zone) {
      // Conversion de la géométrie au format attendu par Turf (format [lat, lon] -> [lon, lat])
      const geometry :any[] = zone.geometry.map((p: any) => [p.lon, p.lat]);
      const closedGeometry =
        geometry[0].lat === geometry[geometry.length - 1].lat &&
        geometry[0].lon === geometry[geometry.length - 1].lon
          ? geometry
          : [...geometry, geometry[0]];
      const turfPolygon = polygon([closedGeometry]);
      const bool=booleanPointInPolygon(turfPoint, turfPolygon);
      if (bool===true) {
        newZone = zone;
        console.log('New Zone:', newZone.zoneId, newZone.type);
        break;
      }
    }
  }
 

  const currentStatus = (await getCurrentStatus(setStatus, status)) || 'pedestrian';
  console.log("current Status", currentStatus);

  console.log("current Zone", currentZone?.zoneId);
  if (newZone && (!currentZone || newZone.zoneId !== currentZone.zoneId)) {
    console.log('Entering Zone:', newZone.zoneId, newZone.type , currentStatus.toString());
    generateNotification(newZone, user, 'entering',currentStatus.toString());
    
  } else if (!newZone && currentZone) {
    console.log('Leaving Zone:', currentZone.zoneId, currentZone.type , currentStatus.toString());
    generateNotification(currentZone, user, 'leaving',currentStatus.toString());
  }

  const nearbyZones = getNearbyZones(location, allZones);
  setZones(nearbyZones);
};


const handleMapClick = (point: Point, mode: SelectionMode) => {
  if (isSimulationMode) {
    setSimulatedLocation(point);
    handleLocationUpdate(point);
  } else if (mode === 'end') {
    setEndPoint(point);
    setSelectionMode('none');
  }
};

  const toggleSimulationMode = useCallback(() => {
    setIsSimulationMode((prev) => !prev);
    if (isSimulationMode) setSimulatedLocation(null);
  }, [isSimulationMode]);

//Find Path
  // const findPath = useCallback(async () => {
  //   if (!userLocation || !endPoint) {
  //     setErrorMessage('Please select both start and end points');
  //     return;
  //   }
  //   setIsLoading(true);
  //   setErrorMessage('');
  //   try {
  //     const response = await axios.post(ASTAR_API, {
  //       start: { lat: userLocation?.coords.latitude, lng: userLocation?.coords.longitude },
  //       end: endPoint,
  //     });
  //     if (response.data.error) {
  //       setErrorMessage(response.data.error);
  //       setPath([]);
  //     } else {
  //       setPath(response.data.path);
  //     }
  //   } catch (error) {
  //     console.log('Error finding path:', error);
  //     setErrorMessage('Failed to find path. Please try again.');
  //     setPath([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [ endPoint]);

  // const resetPath = () => {
  //   setEndPoint(null);
  //   setPath([]);
  //   setSelectionMode('none');
  // };

  return (
    <View style={styles.container}>
     
      <View style={styles.content}>
        <MapComponent
          routes={routes||[]}
          zones={zones}
          trafficLights={trafficLights}
          shouldDisplay={(category, type) =>
            selected[category] || selectedTypes[category].includes(type)
          }
          endPoint={endPoint}
          path={path || []}
          onMapClick={handleMapClick}
          selectionMode={selectionMode}
          userLocation={isSimulationMode ? simulatedLocation : userLocation}
          isSimulation={isSimulationMode}
          userStatus={status}
        />
        <TouchableOpacity style={styles.simulationToggle} onPress={toggleSimulationMode}>
          <Text style={styles.simulationText}>
            {isSimulationMode ? 'Exit Simulation Mode' : 'Enter Simulation Mode'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  simulationToggle: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  simulationText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default Home;

