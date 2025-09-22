import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const CustomHeader = ({ title, rightButton, backName = "Back", routePath }) => {
  const handleBack = () => {
    if (routePath) {
      router.navigate(routePath);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="chevron-back" size={24} color="black" />
        <Text style={styles.backText}>{backName}</Text>
      </TouchableOpacity>

      {/* Page Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Right Button (optional) */}
      <View style={styles.rightButton}>{rightButton}</View>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    width: 70,
  },
  backText: {
    fontSize: 18,
    marginLeft: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  rightButton: {
    width: 70,
    justifyContent: "center",
    alignItems: "flex-end",
  },
});
