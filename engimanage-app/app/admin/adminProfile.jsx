import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

const AdminProfile = () => {
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("adminLoginData");
      router.dismissAll();
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Ionicons name="person-circle-outline" size={100} color="#00ADB5" />
        <Text style={styles.name}>Admin</Text>
        <Text style={styles.role}>System Administrator</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222831",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#393E46",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EEEEEE",
    marginTop: 10,
  },
  role: {
    fontSize: 14,
    color: "#aaaaaa",
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e84545",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
