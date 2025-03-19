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
    geometry: Array<{ [key: string]: number }>;
    currentRisk: 'low' | 'medium' | 'high';
    bbox : BoundingBox | null;
    car:number;
    pedestrian:number;
  }
  
  export interface BoundingBox {
    minY: number;
    maxY: number;
    minX: number;   
    maxX: number;
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
    buildings: Building[];
    routes: Route[];
    zones: Zone[];
    trafficLights: TrafficLight[];
    shouldDisplay: (category: keyof SelectedState, type: string) => boolean;
    endPoint: Point | null;
    path: Array<Point |LocationObject> | null;
    onMapClick: (point:any, mode: SelectionMode) => void;
    selectionMode: SelectionMode;
    userLocation?: LocationObject|Point | null;
    visibleRegion?: Region | null;
    onRegionChange?: (region: Region) => void; // Add this
  }

  export interface user {
    name: string;
    email: string;
    status : string;
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