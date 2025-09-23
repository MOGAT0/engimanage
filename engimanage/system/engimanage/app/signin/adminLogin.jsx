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

import globalScript from "../globals/globalScript";

const link = globalScript;
const API_LINK = `${link.api_link}/adminLogin`; 

export default function AdminLogin() {
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
          console.log("Admin auto login success:", data[0]);
          await saveLogin("loginData", data[0]);
          router.navigate("../admin/adminHandler");
        } else {
          await SecureStore.deleteItemAsync("loginData");
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
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
        setShowModal(false);
        await saveLogin("loginData", data[0]);
        setEmail("");
        setPass("");
        router.navigate("../admin/adminHandler");
      } else {
        Toast.warn("Invalid Admin Credentials");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveLogin = async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
      console.log("Admin login info saved!");
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color="#aa2222" />
        <Text style={{ marginTop: 10 }}>Checking admin login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Container
        position="top"
        showCloseIcon={true}
        duration={1500}
        style={{ width: "200" }}
      />
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
              source={require("../../assets/logo-icon.png")} // 👈 put admin logo here
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Admin Login</Text>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Admin Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <PasswordField
                handleChange={setPass}
                val={pass}
                hintText={"Admin Password"}
                iconColor={"#aa2222"}
                iconSize={30}
              />
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Admin Login</Text>
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
    paddingVertical: 50,
    elevation: 10,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 30,
    color: "#aa2222",
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
    backgroundColor: "#aa2222",
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
