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
import { MapComponentProps, SelectionMode ,Point } from '@/utils/types';
import { LocationObject } from 'expo-location';


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

const randomRiskValue = () : string=>{
  const riskValues :string[] = ['low', 'medium', 'high'];
  const randomIndex = Math.floor(Math.random() * riskValues.length);
  return riskValues[randomIndex];
}


interface ExtendedMapComponentProps extends MapComponentProps {
  userLocation: any | null;
  isSimulation: boolean;

}

// Memoized Polyline component for routes
// const RoutePolyline = React.memo(({ route }: { route: Route }) => {
//   const simplifiedNodes = useMemo(() => {
//     const points = route.nodes.map((n) => ({ x: n.lon, y: n.lat }));
//     const simplified = simplify(points, 0.001, true); // Tolerance of 0.001 (adjustable)
//     return simplified.map((p) => ({ latitude: p.y, longitude: p.x }));
//   }, [route.nodes]);

//   return (
//     <Polyline
//       coordinates={simplifiedNodes}
//       strokeColor={routeColors[route.type] || Colors.routeHighway}
//       strokeWidth={1}
//       lineCap="round"
//       lineJoin="round"
//       zIndex={2}
//     />
//   );
// });

const MapComponent: React.FC<ExtendedMapComponentProps> = ({
  routes = [],
  zones = [],
  trafficLights = [],
  shouldDisplay,
  endPoint,
  path,
  onMapClick,
  selectionMode,
  userLocation,
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
              latitude: p.lat,
              longitude: p.lon
            }))}
            strokeColor={getRiskColor(randomRiskValue())}
            fillColor={getRiskColor(randomRiskValue())}
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


const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapComponent;