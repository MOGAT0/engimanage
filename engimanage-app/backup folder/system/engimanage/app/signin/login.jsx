import React, { useState } from "react";
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
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import globalScript from "../globals/globalScript";

const link =globalScript;
const API_LINK = `${link.api_link}/login`;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (email === "" || pass === "") {
      Toast.error("Empty Fields");
    }

    try {
      const reqData = {
        email: email,
        pass: pass,
      };

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
        await saveLogin("loginData", data[0]);
        setUserActivity(data[0].ID);
        setEmail("");
        setPass("");
        router.push("/tabsHandler");
      } else {
        Toast.warn("Invalid Credentials");
      }
    } catch (error) {
      return;
    }
  };

    const setUserActivity = async (userID)=>{
    try {
      const reqBody = {
        userID,
        status : "active"
      }

      const response = await fetch(`${link.api_link}/updateUserStatus`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body: JSON.stringify(reqBody)
      })

      const data = await response.json();

    } catch (error) {
      
    }
  }

  const saveLogin = async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
      console.log("login info saved!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.screen}>
      <Container position="top" showCloseIcon={false}/>
      <View style={styles.container}>
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
          <TouchableOpacity style={styles.linkContainer} onPress={()=>router.push("./forgotpass")}>
            <Text style={styles.pageLink}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>
          
        </View>
        <Text style={styles.signup}>
          Don't have an account?
          <Link style={styles.signupLink} href={"./register"}> Sign up</Link>
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
            <Ionicons name="logo-apple" size={18} color="white" />
            <Text style={styles.socialText}>Log in with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
            <Ionicons name="logo-google" size={18} color="#000" />
            <Text style={[styles.socialText, { color: "#000" }]}>
              Log in with Google
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 350,
    height: 500,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
    alignSelf: "center",
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
  linkContainer: {
    alignItems: "flex-end",
    marginTop: 5,
  },
  pageLink: {
    fontSize: 12,
    fontWeight: "700",
    textDecorationLine: "underline",
    color: "#747474",
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
  signup: {
    fontSize: 15,
    color: "#747474",
    textAlign: "center",
    marginTop: 10,
  },
  signupLink: {
    color: "#332277",
    textDecorationLine: "underline",
    fontWeight: "800",
    fontSize: 15,
  },
  buttonsContainer: {
    marginTop: 20,
    gap: 15,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 20,
    justifyContent: "center",
  },
  socialText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  appleButton: {
    backgroundColor: "#000",
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#747474",
  },
});
