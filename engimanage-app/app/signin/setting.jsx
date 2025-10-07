// Setting.js
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import Toast from "react-native-toast-message";

import CustomHeader from "../components/customHeader";
import globalScript from "../globals/globalScript";

const link = globalScript;

const Setting = () => {
  const [ip, setIp] = useState(link.ipaddress);
  const [loading, setLoading] = useState(false);

  const handleTestConnection = async () => {
    if (!ip) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter an IP address",
      });
      return;
    }

    console.log(`http://${ip}:${link.port}/api/testconnection`);
    

    setLoading(true);
    try {
      // Example fetch (replace with your backend endpoint)
      const response = await fetch(`http://${ip}:${link.port}/api/testconnection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            newIP:ip
        }),
      });

      const data = await response.json();

      if (data.ok) {
        Alert.alert("Success","Connection successful")
        // Toast.show({
        //   type: "success",
        //   text1: "Connection successful 🎉",
        // });
      } else {
        Alert.alert("Error","Connection failed")
        // Toast.show({
        //   type: "error",
        //   text1: "Connection failed ❌",
        // });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error connecting to server",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title={"Setting"} />
      <Text style={styles.label}>Enter IP Address:</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 192.168.1.1"
        value={ip}
        onChangeText={setIp}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleTestConnection}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Test Connection</Text>
        )}
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#00ADB5",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
