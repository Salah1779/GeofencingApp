
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import axios from 'axios';
import RBush from 'rbush';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { polygon, point } from '@turf/helpers';
import * as Location from 'expo-location';
import Colors from '@/constants/Colors';
import Sidebar from '@/components/SideBar';
import MapComponent from '@/components/mapComponent';
import PathController from '@/components/PathController';
import { configureNotifications, sendNotification } from '@/utils/notificationService';
import {
  Building,
  Route,
  Zone,
  TrafficLight,
  SelectedState,
  SelectedTypesState,
  Point,
  SelectionMode,
} from '@/utils/types';
import useLocationPermission from '@/hooks/useLocationPermission';
import useNotificationPermission from '@/hooks/useNotificationPermission';
import { getData } from '@/utils/AsyncStorage';
import {getRiskLevel} from '@/utils/helpers';

// API endpoints
const IP_BACKEND = '192.168.11.101' ;
const BUILDINGS_API = `http://${IP_BACKEND}:8080/api/buildings`;
const ROUTES_API = `http://${IP_BACKEND}:8081/api/routes`;
const ZONES_API = `http://${IP_BACKEND}:8084/api/zones`;
const TRAFFIC_API = `http://${IP_BACKEND}:8083/api/trafficLights`;
const ASTAR_API = `http://${IP_BACKEND}:8090/api/findPath`;
const Routes_Post = `http://${IP_BACKEND}:8090/api/sendRoutes`;
const Zones_RISK = `http://${IP_BACKEND}:8085/api/buildingRisc/risc`;
const WEBSOCKET_URL = `ws://${IP_BACKEND}:8085/risk-updates`;

const Home: React.FC = () => {
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

  // Ajouter une référence pour suivre l'état actuel des zones
   const zonesRef = useRef(zones);
  const rtree = useRef(new RBush());
  const lastCheckTime = useRef(0);
  const checkInterval = 5000;

  useEffect(() => {
    configureNotifications();
  }, []);

  // Mettre à jour la référence quand les zones changent
useEffect(() => {
  zonesRef.current = zones;
}, [zones]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const [buildingsRes, routesRes, zonesRes, trafficRes] = await Promise.all([
        axios.get(BUILDINGS_API),
        axios.get(ROUTES_API),
        axios.get(ZONES_API),
        axios.get(TRAFFIC_API),
      ]);

      const fetchedZones = zonesRes.data.processedZones;
      console.log('fetched Zones first LoAD' ,JSON.stringify(fetchedZones[0]));
      setAllZones(fetchedZones);
     
    
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  fetchData();
}, []);
// Fetch risk data and update zones
useEffect(() => {
  const fetchRiskData = async () => {
    // Ne rien faire si les zones ne sont pas chargées
    if (!zones.length) return;

    try {
      console.log('Length of Data sent' ,zonesRef.current.length );
      console.log('first Zone before Risk calculation', JSON.stringify(zonesRef.current[0]));
      const response = await axios.post(Zones_RISK, { zones: zonesRef.current });
      const status = await getData('status') || 'pedestrian';
      
       setZones(response.data.zones.map((zone: any) => ({
        ...zone,
        currentRisk: getRiskLevel(zone[`${status}`])
      })));
      console.log('first Zone after Risk calculation', response.data.zones[0]);

    } catch (error) {
      console.error('Risk calculation error:', error);
    }
  };

  fetchRiskData();
}, [zones]); // Déclencher quand les zones changent


  // Fetch API data on mount
 

//WebSocket pour les mises à jour en temps réel
// useEffect(() => {
//   const ws = new WebSocket(WEBSOCKET_URL);

//   ws.onmessage = async (event) => {
//     const message = JSON.parse(event.data);
//     if (message.type === 'zone_update') {
//       const status = await getData('status') || 'pedestrian';

//       setZones(prevZones => 
//         prevZones.map(z => 
//           z.zoneId === message.data.zoneId ? {
//             ...z,
//             ...message.data,
//             currentRisk: getRiskLevel(message.data[`${status}`])
//           } : z
//         )
//       );
//     }
//   };

//   return () => ws.close();
// }, []); // Une seule initialisation

  // Build R-tree and filter nearby zones
  useEffect(() => {
    rtree.current.clear();
    allZones.forEach((zone) => {
      const bbox =zone.boundingBox || getBoundingBox(zone.geometry);
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

  // Compute bounding box for a zone
  const getBoundingBox = useCallback((geometry: any) => {
    let minLon = Infinity,
      minLat = Infinity,
      maxLon = -Infinity,
      maxLat = -Infinity;
    geometry.forEach((point: any) => {
      const lon = point[0];
      const lat = point[1];
      if (lon === undefined || lat === undefined) return;
      minLon = Math.min(minLon, lon);
      minLat = Math.min(minLat, lat);
      maxLon = Math.max(maxLon, lon);
      maxLat = Math.max(maxLat, lat);
    });
    return { minX: minLon, minY: minLat, maxX: maxLon, maxY: maxLat };
  }, []);

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


  const getNearbyZones = (location: any, zones: Zone[]): Zone[] => {
    if (!location) return zones;
    const lat = 'coords' in location ? location.coords.latitude : location.lat;
    const lon = 'coords' in location ? location.coords.longitude : location.lng;

    const nearby = zones.filter((zone) => {
      const centroid = getZoneCentroid(zone.geometry);
      const distance = getDistance(lat, lon, centroid.lat, centroid.lon);
      return distance <= 1;
    });
    return nearby;
  };

  // Calculate zone centroid
  const getZoneCentroid = (geometry: any): { lat: number; lon: number } => {
    let latSum = 0,
      lonSum = 0,
      count = 0;
    geometry.forEach((point: any) => {
      const lon = point[0];
      const lat = point[1];
      if (lon !== undefined && lat !== undefined) {
        latSum += lat;
        lonSum += lon;
        count++;
      }
    });
    return { lat: latSum / count, lon: lonSum / count };
  };

  // Handle location updates
  const handleLocationUpdate = (location: any) => {
    const now = Date.now();
    if (now - lastCheckTime.current < checkInterval) return;
    lastCheckTime.current = now;

    const lon = location.coords?.longitude ?? location.lng;
    const lat = location.coords?.latitude ?? location.lat;
    const turfPoint = point([lon, lat]);

    const candidates = rtree.current.search({
      minX: lon,
      minY: lat,
      maxX: lon,
      maxY: lat,
    });

    let newZone: Zone | null = null;
    for (const candidate of candidates) {
      const zone=zones.find((z) => z.zoneId === candidate.zoneId);
      if (zone) {
        const geometry = zone.geometry.map((p: any) => [p[0], p[1]]);
        const closedGeometry =
          geometry[0][0] === geometry[geometry.length - 1][0] &&
          geometry[0][1] === geometry[geometry.length - 1][1]
            ? geometry
            : [...geometry, geometry[0]];
        const turfPolygon = polygon([closedGeometry]);
        if (booleanPointInPolygon(turfPoint, turfPolygon)) {
          newZone = zone;
          break;
        }
      }
    }

    if (newZone && (!currentZone || newZone.zoneId !== currentZone.zoneId)) {
      console.log('Entering Zone:', newZone.zoneId, newZone.type);
      sendNotification(`Entered ${newZone.type} zone`);
      setCurrentZone(newZone);
    } else if (!newZone && currentZone) {
      console.log('Exiting Zone:', currentZone.zoneId, currentZone.type);
      sendNotification(`Exited ${currentZone.type} zone`);
      setCurrentZone(null);
    }

    const nearbyZones = getNearbyZones(location,allZones);
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
      {/* <Sidebar
        selected={selected}
        selectedTypes={selectedTypes}
        uniqueBuildingTypes={[...new Set(buildings.map((b) => b.type))]}
        uniqueRouteTypes={[...new Set(routes.map((r) => r.type))]}
        uniqueZoneTypes={[...new Set(zones.map((z) => z.type))]}
        uniqueTrafficTypes={[...new Set(trafficLights.map((t) => t.type))]}
        toggleCategory={(category) =>
          setSelected((prev) => ({ ...prev, [category]: !prev[category] }))
        }
        toggleType={(category, type) =>
          setSelectedTypes((prev) => ({
            ...prev,
            [category]: prev[category].includes(type)
              ? prev[category].filter((t) => t !== type)
              : [...prev[category], type],
          }))
        }
        isOpen={false}
        onToggle={() => {}}
      /> */}
       {/* <PathController
        startPoint={userLocation}
        endPoint={endPoint}
        onSetSelectionMode={setSelectionMode}
        onFindPath={findPath}
        onResetPath={resetPath}
        isLoading={isLoading}
        errorMessage={errorMessage}
        selectionMode={selectionMode}
      />   */}
      <View style={styles.content}>
        <MapComponent
          buildings={buildings}
          routes={routes}
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
          visibleRegion={null}
          onRegionChange={() => {}}
          isSimulation={isSimulationMode}
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