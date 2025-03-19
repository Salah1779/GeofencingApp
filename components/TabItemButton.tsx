import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export const TabItemButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  label,
}: {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: string;
  label: string;
}) => {
  const scale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0);
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.1]) }],
      top: interpolate(scale.value, [0, 1], [0, -2]),
    };
  });

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.tabbarItem}>
      <Animated.View style={animatedIconStyle}>
        <Feather
          name={label === "Home" ? "home" : label === "Profile" ? "user" : "bell"}
          size={20}
          color={isFocused ? Colors.textOnPrimary : "#888"}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tabbarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
export default TabItemButton;