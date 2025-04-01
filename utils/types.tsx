import { LocationObject } from 'expo-location';
export interface Building {
    id: number;
    name: string;
    type: string;
    lat: number;
    lon: number;
  }
  
  export interface TrafficLight {
    id: number;
    type: string;
    lat: number;
    lon: number;
  }
  
  export interface Route {
    id: number;
    name: string;
    type: string;
    nodes: { lat: number, lon: number }[];
  }
  
  export interface Zone {
    zoneId: string;
    type: string;
    geometry:Array<{lat: number, lon: number }>;
    currentRisk_car?: 'faible' | 'moyen' | 'elevee' | 'none' ;
    currentRisk_pedestrian?: 'faible' | 'moyen' | 'elevee' | 'none' ;
    bounding_box : BoundingBox ;
  
  }
  
 export interface BoundingBox  {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
 }
  
  export interface Notification {
    id: string; 
    title: string;
    message: string;
    date: Date;
    seen: boolean;
    
  }
  export interface SelectedState {
    buildings: boolean;
    routes: boolean;
    zones: boolean;
    trafficLights: boolean;
  }
  
  
  
  export interface SelectedTypesState {
    buildings: string[];
    routes: string[];
    zones: string[];
    trafficLights: string[];
  }
  
  export interface SidebarProps {
    selected: SelectedState;
    selectedTypes: SelectedTypesState;
    uniqueBuildingTypes: string[];
    uniqueRouteTypes: string[];
    uniqueZoneTypes: string[];
    uniqueTrafficTypes: string[];
    toggleCategory: (category: keyof SelectedState) => void;
    toggleType: (category: keyof SelectedTypesState, type: string) => void;
  }
  
  
  export interface Point {
    lat: number;
    lng: number;
  }
  
  export type SelectionMode = 'start' | 'end' | 'none';
  
  export interface MapComponentProps {
    routes?: Route[];
    zones: Zone[];
    trafficLights?: TrafficLight[];
    shouldDisplay: (category: keyof SelectedState, type: string) => boolean;
    endPoint?: Point | null;
    path?: Array<Point |LocationObject> | null;
    onMapClick: (point:any, mode: SelectionMode) => void;
    selectionMode: SelectionMode;
    userLocation?: LocationObject|Point | null;
   
  }


  export interface StatusOption {
    label: string;
    icon: string;
  }

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface User {
    userId: number;
    first_name: string;
    last_name: string;
    email: string;
    token?: string;
  }