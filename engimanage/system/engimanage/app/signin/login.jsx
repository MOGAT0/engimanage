import React, { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import Container, { Toast } from "toastify-react-native";
import PasswordField from "../components/passwordField";
import * as SecureStore from "expo-secure-store";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import globalScript from "../globals/globalScript";

const link = globalScript;
const API_LINK = `${link.api_link}/login`;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userData = await SecureStore.getItemAsync("loginData");
        if (!userData) {
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(userData);
        if (!parsed?.email || !parsed?.pass) {
          setLoading(false);
          return;
        }

        // validate with API
        const reqData = { email: parsed.email, pass: parsed.pass };
        const response = await fetch(API_LINK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(reqData),
        });

        const data = await response.json();

        if (response.ok && Object.keys(data).length >= 1) {
          console.log("Auto login success:", data[0]);
          await saveLogin("loginData", data[0]);
          setUserActivity(data[0].ID);
          router.navigate("/tabsHandler");
        } else {
          await SecureStore.deleteItemAsync("loginData");
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (email === "" || pass === "") {
      Toast.error("Empty Fields");
      return;
    }
    
    try {
      const reqData = { email, pass };
      
      const response = await fetch(API_LINK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(reqData),
      });
      
      const data = await response.json();
      
      if (response.ok && Object.keys(data).length >= 1) {
        setShowModal(false)
        await saveLogin("loginData", data[0]);
        setUserActivity(data[0].ID);
        setEmail("");
        setPass("");
        router.navigate("/tabsHandler");
      } else {
        Toast.warn("Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setUserActivity = async (userID) => {
    try {
      const reqBody = { userID, status: "active" };
      await fetch(`${link.api_link}/updateUserStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const saveLogin = async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
      console.log("login info saved!");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color="#332277" />
        <Text style={{ marginTop: 10 }}>Checking login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Container position="top" showCloseIcon={true} duration={1500} style={{ width: "200" }} />
      <Modal
        transparent
        visible={showModal}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          {/* form box */}
          <View style={styles.container}>
            <Image
              source={require("../../assets/logo-icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome back</Text>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <PasswordField
                handleChange={setPass}
                val={pass}
                hintText={"Password"}
                iconColor={"#331177"}
                iconSize={30}
              />
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 350,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    paddingVertical:50,
    elevation: 10,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 30,
  },
  form: {
    gap: 18,
  },
  input: {
    borderRadius: 20,
    borderColor: "#c0c0c0",
    borderWidth: 1,
    padding: 12,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#332277",
    padding: 12,
    borderRadius: 20,
    marginTop: 10,
    alignItems: "center",
    elevation: 3,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 10,
    marginTop: -25,
  },
});
