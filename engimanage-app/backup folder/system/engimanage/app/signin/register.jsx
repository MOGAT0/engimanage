import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Link, router } from "expo-router";
import Container, { Toast } from "toastify-react-native";
import PasswordField from "../components/passwordField";
import Ionicons from "@expo/vector-icons/Ionicons";

import globalScript from "../globals/globalScript";

const link = globalScript
const API_LINK = `${link.api_link}/register`;

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newFname = fname.replace(/\s/g,'_')
    const newLname = lname.replace(/\s/g,'_')

    try {
      const reqData = {
        email,
        password,
        confirmPass,
        fname : newFname,
        lname : newLname,
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
        router.push("./login");
      } else {
        Toast.error(`${data.message}`);
      }
    } catch (error) {
      console.error(`server error: ${error}`);
    }
  };
  return (
    <View style={styles.screen}>
      <Container position="top" style={{width:'fit_content',overflow:"hidden"}} showCloseIcon={false}/>
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
              value={fname}
              onChangeText={setFname}
            />
            <TextInput
              style={styles.input}
              placeholder="Lastname"
              value={lname}
              onChangeText={setLname}
            />
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <PasswordField
              handleChange={setPassword}
              val={password}
              hintText={"Password"}
              iconColor={"#331177"}
              iconSize={30}
            />
            <PasswordField
              handleChange={setConfirmPass}
              val={confirmPass}
              hintText={"Confirm password"}
              iconColor={"#331177"}
              iconSize={30}
            />

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleSubmit}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.loginLabel}>
            Already have an account?
            <Link style={styles.loginLink} href={"./login"}>
              Login
            </Link>
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
              <Ionicons name="logo-apple" size={18} color="#fff" />
              <Text style={styles.socialText}>Register with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
            >
              <Ionicons name="logo-google" size={18} color="#000" />
              <Text style={[styles.socialText, { color: "#000" }]}>
                Register with Google
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 350,
    minHeight: 550,
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
    marginBottom: 25,
  },
  form: {
    gap: 15,
    marginBottom: 10,
  },
  input: {
    borderRadius: 20,
    borderColor: "#c0c0c0",
    borderWidth: 1,
    padding: 12,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: "#332277",
    padding: 12,
    borderRadius: 20,
    marginTop: 10,
    alignItems: "center",
    elevation: 3,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loginLabel: {
    fontSize: 15,
    color: "#747474",
    textAlign: "center",
    marginTop: 10,
  },
  loginLink: {
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
