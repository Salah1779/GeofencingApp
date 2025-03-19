const Colors = {
  // Core Theme Colors
  primary: 'rgb(212, 199, 11)',        // Dodger blue for primary buttons and actions
  secondary: '#FF8C00',      // Dark orange for secondary actions or highlights
  accent: '#FFD700',         // Gold for map pins, highlights, or special elements

  // Background Colors
  background: '#F5F7FA',     // Light grayish-blue for app background
  cardBackground: '#FFFFFF', // White for cards or modals
  headerBackground: '#1C2526', // Dark charcoal for header background

  // Text Colors
  textPrimary: '#1C2526',    // Dark charcoal for primary text
  textSecondary: '#6B7280',  // Gray for secondary text
  textOnPrimary: '#FFFFFF',  // White text on primary buttons/backgrounds

  // Header Tint
  headerTint: '#1E90FF',     // Matches primary for header icons and text

  // Status Colors
  success: '#22C55E',        // Green for success states (e.g., inside geofence)
  warning: '#F59E0B',        // Amber for warnings (e.g., approaching geofence boundary)
  error: '#EF4444',          // Red for errors (e.g., geofence breach)

  // Risk-Specific Colors
  riskHighColor: 'rgba(239, 68, 68, 0.5)',    
  riskMidHighColor: 'rgba(249, 115, 22, 0.5)', 
  riskMidColor: 'rgba(245, 158, 11, 0.5)',     
  riskLowColor: 'rgba(34, 197, 94, 0.5)',     

  // Map and Geofencing Specific Colors
  geofenceBoundary: '#FF0000', // Red for geofence boundaries
  geofenceFill: 'rgba(30, 144, 255, 0.2)', // Semi-transparent blue for geofence fill
  userMarker: '#FFD700',     // Gold for user location marker

  // Miscellaneous
  border: '#D1D5DB',         // Light gray for borders or dividers
  shadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadow for elevation
  disabled: '#B0BEC5', 
  
  sidebarBackground: 'rgba(73, 120, 221, 0.83)', // Gray for disabled buttons or elements
  sidebarHover: 'rgba(35, 124, 214, 0.54)',// Light gray for hover state

  // Building Colors
  buildingResidential: '#3B82F6', // Blue
  buildingCommercial: '#60A5FA',  // Light Blue
  buildingIndustrial: '#1D4ED8',  // Dark Blue

  // Route Colors
  routeHighway: '#6B7280',        // Gray
  routePrimary: '#9CA3AF',        // Light Gray
  routeSecondary: '#D1D5DB',      // Very Light Gray

  // Path Color
  pathColor: '#00C4B4',           // Teal for path

  // Miscellaneous
  trafficLightColor: '#FFFF00',   // Yellow for traffic light icon
 
};

export default Colors;