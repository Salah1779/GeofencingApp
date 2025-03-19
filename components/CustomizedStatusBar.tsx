import React from 'react';
import { StatusBar, View, Platform, StyleSheet } from 'react-native';

// Define the props interface for the CustomizedStatusBar component
interface CustomizedStatusBarProps {
  backgroundColor?: string;
  barStyle?: 'default' | 'light-content' | 'dark-content';
  translucent?: boolean;
  hidden?: boolean;
  networkActivityIndicatorVisible?: boolean;
  showHideTransition?: 'fade' | 'slide' | 'none';
  animated?: boolean;
  [key: string]: any; // Allow additional props to be passed through (e.g., StatusBar-specific props)
}

const CustomizedStatusBar: React.FC<CustomizedStatusBarProps> = ({
  backgroundColor = 'midnightblue',
  barStyle = 'light-content',
  translucent = false,
  hidden = false,
  networkActivityIndicatorVisible = false,
  showHideTransition = 'fade',
  animated = true,
  ...props
}) => {
  return (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <StatusBar
        translucent={translucent}
        backgroundColor={backgroundColor}
        barStyle={barStyle}
        hidden={hidden}
        networkActivityIndicatorVisible={networkActivityIndicatorVisible}
        showHideTransition={showHideTransition}
        animated={animated}
        {...props}
      />
    </View>
  );
};

// Determine the status bar height based on the platform
const STATUSBAR_HEIGHT: number = Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight ?? 0);

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
});

export default CustomizedStatusBar;