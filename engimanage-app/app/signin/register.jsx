import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import Container, { Toast } from "toastify-react-native";
import PasswordField from "../components/passwordField";
import Ionicons from "@expo/vector-icons/Ionicons";

import CustomHeader from "../components/customHeader";
import globalScript from "../globals/globalScript";
import { SafeAreaView } from "react-native-safe-area-context";

const link = globalScript;
const API_LINK = `${link.api_link}/register`;

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newFname = fname.replace(/\s/g, "_");
    const newLname = lname.replace(/\s/g, "_");

    try {
      const reqData = {
        email,
        password,
        confirmPass,
        fname: newFname,
        lname: newLname,
      };

      const response = await fetch(API_LINK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
      });

      const data = await response.json();

      if (
        response.ok &&
        email !== "" &&
        password !== "" &&
        fname !== "" &&
        lname !== ""
      ) {
        alert("Success!");
        router.back();
      } else {
        Toast.error(`${data.message}`);
      }
    } catch (error) {
      console.error(`server error: ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Container
        position="top"
        style={{ width: "fit_content", overflow: "hidden" }}
        showCloseIcon={false}
      />
      <CustomHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Create Account</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Firstname"
              placeholderTextColor="#999"
              value={fname}
              onChangeText={setFname}
            />
            <TextInput
              style={styles.input}
              placeholder="Lastname"
              placeholderTextColor="#999"
              value={lname}
              onChangeText={setLname}
            />
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
            />
            <PasswordField
              handleChange={setPassword}
              val={password}
              hintText={"Password"}
              iconColor={"#00ADB5"}
              iconSize={28}
            />
            <PasswordField
              handleChange={setConfirmPass}
              val={confirmPass}
              hintText={"Confirm Password"}
              iconColor={"#00ADB5"}
              iconSize={28}
            />

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleSubmit}
            >
              <Ionicons name="person-add-outline" size={18} color="#fff" />
              <Text style={styles.registerButtonText}>Create</Text>
            </TouchableOpacity>
          </View>

          {/* Optional bottom link */}
          {/* <Text style={styles.loginLabel}>
            Already have an account?
            <Link style={styles.loginLink} href={"./login"}>
              Login
            </Link>
          </Text> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#222831", // Dark background
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  container: {
    width: 350,
    minHeight: 550,
    backgroundColor: "#393E46", // Slightly lighter dark card
    borderRadius: 12,
    padding: 25,
    elevation: 6,
    alignSelf: "center",
    justifyContent: "center",
    marginTop: -150,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "800",
    color: "#EEEEEE",
    marginBottom: 25,
  },
  form: {
    gap: 15,
    marginBottom: 10,
  },
  input: {
    borderRadius: 10,
    borderColor: "#555",
    borderWidth: 1,
    padding: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    backgroundColor: "#222831",
    color: "#EEEEEE",
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00ADB5",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    gap: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginLabel: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center",
    marginTop: 15,
  },
  loginLink: {
    color: "#00ADB5",
    textDecorationLine: "underline",
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 4,
  },
});
