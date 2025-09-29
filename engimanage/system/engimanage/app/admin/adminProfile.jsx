import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

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
      <Text style={styles.title}>Admin Profile</Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

export default AdminProfile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#393E46",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: "#aa2222",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  logoutText: {
    color: "#c2c2c2",
    fontSize: 16,
    fontWeight: "bold",
  },
})
