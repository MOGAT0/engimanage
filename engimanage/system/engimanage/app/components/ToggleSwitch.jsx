// components/Switch.jsx
import React from "react";
import { View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const ToggleSwitch = ({ value, size = 35 }) => {
  return (
    <View>
      <Ionicons
        name={value ? "toggle" : "toggle-outline"}
        size={size}
        color={value ? "#2ecc71" : "grey"}
      />
    </View>
  );
};

export default ToggleSwitch;
