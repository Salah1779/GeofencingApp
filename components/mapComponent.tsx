import React, { useEffect, useRef, useMemo } from 'react';
import MapView, {
  Marker,
  Polyline,
  Polygon,
  Circle,
  MapPressEvent,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { MapComponentProps, SelectionMode ,Route,Point } from '@/utils/types';
import { LocationObject } from 'expo-location';
import simplify from 'simplify-js';

// // Building colors
// const buildingColors: { [key: string]: string } = {
//   residential: Colors.buildingResidential,
//   commercial: Colors.buildingCommercial,
//   industrial: Colors.buildingIndustrial,
// };

// // Route colors
// const routeColors: { [key: string]: string } = {
//   highway: Colors.routeHighway,
//   primary: Colors.routePrimary,
//   secondary: Colors.routeSecondary,
// };


    // rgba(239, 68, 68, 0.5)
     // rgba(245, 158, 11, 0.5)
    // rgba(34, 197, 94, 0.5)
const getRiskColor = (risk : string): string =>{
  if(risk === 'high'){
    return Colors.riskHighColor;
  }else if(risk === 'medium'){
    return Colors.riskMidColor;
  }else{
    return Colors.riskLowColor;
  }
}


// const getRandomRiskColor=() : string=>{
//   const colors :string[] = [Colors.riskHighColor, Colors.riskMidColor, Colors.riskLowColor];
//   const randomIndex = Math.floor(Math.random() * colors.length);
//   return colors[randomIndex];
// }
// Extend MapComponentProps to include userLocation and visibleRegion
interface ExtendedMapComponentProps extends MapComponentProps {
  userLocation: any | null;
  visibleRegion: Region | null;
  onRegionChange?: (region: Region) => void;
  isSimulation: boolean;

}

// Memoized Polyline component for routes
const RoutePolyline = React.memo(({ route }: { route: Route }) => {
  const simplifiedNodes = useMemo(() => {
    const points = route.nodes.map((n) => ({ x: n.lon, y: n.lat }));
    const simplified = simplify(points, 0.001, true); // Tolerance of 0.001 (adjustable)
    return simplified.map((p) => ({ latitude: p.y, longitude: p.x }));
  }, [route.nodes]);

  return (
    <Polyline
      coordinates={simplifiedNodes}
      strokeColor={routeColors[route.type] || Colors.routeHighway}
      strokeWidth={1}
      lineCap="round"
      lineJoin="round"
      zIndex={2}
    />
  );
});

const MapComponent: React.FC<ExtendedMapComponentProps> = ({
  buildings = [],
  routes = [],
  zones = [],
  trafficLights = [],
  shouldDisplay,
  endPoint,
  path,
  onMapClick,
  selectionMode,
  userLocation,
  visibleRegion,
  onRegionChange,
  isSimulation,
}) => {
  const mapRef = useRef<MapView>(null);


  // Center the map on user location when it updates
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude ,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [userLocation]);

  // Handle map press for click events
  const handleMapPress = (event: MapPressEvent) => {
    if (selectionMode !== 'none' || isSimulation) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
        onMapClick({coords :{ latitude, longitude }}, selectionMode);
    }
  };

  // // Filter routes based on visible region
  // const visibleRoutes = useMemo(() => {
  //   if (!visibleRegion) return routes; // Render all routes if no region is set
  //   return routes.filter((route) =>
  //     route.nodes.some((node) =>
  //       isPointInRegion(node.lat, node.lon, visibleRegion)
  //     )
  //   );
  // }, [routes, visibleRegion]);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: userLocation?.coords.latitude || 33.69,
        longitude: userLocation?.coords.longitude || -7.38,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      zoomEnabled={true}
      scrollEnabled={true}
      onPress={handleMapPress}
      onRegionChangeComplete={onRegionChange}
    >
      {/* User Location Marker */}
      {userLocation && (
        <Marker
          coordinate={{
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          }}
          title="Your Location"
          zIndex={8}
        >
          <Ionicons name="location-sharp" size={30} color={Colors.primary} />
        </Marker>
      )}

      {/* Buildings
      {buildings.map((building) =>
        shouldDisplay('buildings', building.type) ? (
          <Circle
            key={building.id}
            center={{ latitude: building.lat, longitude: building.lon }}
            radius={8}
            strokeColor={buildingColors[building.type] || Colors.buildingResidential}
            fillColor={buildingColors[building.type] || Colors.buildingResidential}
            strokeWidth={1}
            zIndex={1}
          />
        ) : null
      )} */}

      {/* Visible Routes
      {visibleRoutes.map((route) =>
        shouldDisplay('routes', route.type) ? (
          <RoutePolyline key={route.id} route={route} />
        ) : null
      )} */}

      {/* Zones */}
      {zones.map((zone) =>
       
          <Polygon
            key={zone.zoneId}
            coordinates={zone.geometry.map((p) => ({
              latitude: p[1],
              longitude: p[0],
            }))}
            strokeColor={getRiskColor(zone.currentRisk)}
            fillColor={getRiskColor(zone.currentRisk)}
            strokeWidth={0.5}
            zIndex={3}
          />
        
      )}

      {/* Traffic Lights */}
      {trafficLights.map((trafficLight) =>
        shouldDisplay('trafficLights', trafficLight.type) ? (
          <Marker
            key={trafficLight.id}
            coordinate={{
              latitude: trafficLight.lat,
              longitude: trafficLight.lon,
            }}
            zIndex={4}
          >
            <FontAwesome6 name="traffic-light" size={25} color={Colors.trafficLightColor} />
          </Marker>
        ) : null
      )}

      {/* Path */}
      {path && path.length > 0 && (
        <Polyline
          coordinates={path.map((p) => {
            if ('coords' in p) {
              return {
                latitude: (p as LocationObject).coords.latitude,
                longitude: (p as LocationObject).coords.longitude,
              };
            } else {
              return {
                latitude: (p as Point).lat,
                longitude: (p as Point).lng,
              };
            }
          })}
          strokeColor={Colors.pathColor}
          strokeWidth={6}
          zIndex={5}
        />
      )}

  
      {/* End Marker */}
      {endPoint && (
        <Marker
          coordinate={{ latitude: endPoint.lat, longitude: endPoint.lng }}
          zIndex={7}
        >
          <Ionicons name="location-sharp" size={30} color={Colors.error} />
        </Marker>
      )}
    </MapView>
  );
};

// Helper function to check if a point is within the visible region
const isPointInRegion = (lat: number, lon: number, region: Region): boolean => {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
  const minLat = latitude - latitudeDelta / 2;
  const maxLat = latitude + latitudeDelta / 2;
  const minLon = longitude - longitudeDelta / 2;
  const maxLon = longitude + longitudeDelta / 2;

  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapComponent;