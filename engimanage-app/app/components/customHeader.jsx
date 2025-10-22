import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const CustomHeader = ({ title, rightButton, backName = "Back", routePath, bg_color,text_color }) => {
  const handleBack = () => {
    if (routePath) {
      router.navigate(routePath);
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, {backgroundColor:bg_color? bg_color : "#fff"}]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="chevron-back" size={24} color={text_color ? text_color : "black"} />
        <Text style={[styles.backText,{color:text_color ? text_color : "black"}]}>{backName}</Text>
      </TouchableOpacity>

      {/* Page Title */}
      <Text style={[styles.title,{color:text_color ? text_color : "black"}]}>{title}</Text>

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
    backgroundColor:"#fff",
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
