import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import Container, { Toast } from "toastify-react-native";

import globalScript from "./globals/globalScript";

const link = globalScript;
const { width } = Dimensions.get("screen");

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userID, setUserID] = useState(null);
  const [email, setEmail] = useState(null);
  const [pass, setPass] = useState(null);
  const [fullname, setFullname] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const getLogin = async () => {
      try {
        const userData = await SecureStore.getItemAsync("loginData");
        console.log(userData);

        const data = JSON.parse(userData);
        if (data) {
          setUserID(data.ID);
          setEmail(data.email);
          setPass(data.pass);
          updateDisplay(data.ID);
          setFullname(
            `${data.fname.charAt(0).toUpperCase() + data.fname.slice(1)} ${
              data.lname.charAt(0).toUpperCase() + data.lname.slice(1)
            }`
          );
          setRole(data.role);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getLogin();
  }, []);

  const updateDisplay = async (ID) => {
    if (!ID) return console.log("No ID");

    try {
      const response = await fetch(`${link.api_link}/getProfileImg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: ID }),
      });
      const data = await response.json();

      if (data[0].profile_image) {
        setProfile(`${link.serverLink}${data[0].profile_image}`);
        setSuccess(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert(
        "Permission denied",
        "You need to grant media library access to pick an image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setProfile(result.assets[0].uri);
      updateProfileImg(result.assets[0].uri, userID);
      updateLogin();
      setSuccess(true);
    } else {
      Toast.info("Action canceled");
    }
  };

  const updateLogin = async () => {
    if (!email || !pass) return Toast.error("Empty Fields");
    try {
      const response = await fetch(`${link.api_link}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pass }),
      });
      const data = await response.json();
      if (response.ok && Object.keys(data).length >= 1) {
        await SecureStore.setItemAsync("loginData", JSON.stringify(data[0]));
      } else {
        Toast.warn("Invalid Credentials");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateProfileImg = async (imageUri, ID) => {
    console.log(`User ID: ${ID}`);

    if (!imageUri || !ID) return console.log("Missing image or user ID");

    const fileName = imageUri.split("/").pop();
    const fileType = fileName.split(".").pop();

    // double-check before upload
    if (!["png", "jpg", "jpeg"].includes(fileType)) {
      Toast.error("Invalid file type. Only PNG, JPG, JPEG allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: fileName,
      type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
    });
    formData.append("userID", ID);

    try {
      const response = await fetch(`${link.api_link}/uploadProfileImg`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setProfile(`${link.api_link}${data.path}`);
        updateDisplay(userID);
        Toast.success("Profile Changed Successfully");
      } else {
        Toast.error("Error uploading image");
      }
    } catch (error) {
      console.log(error);
      Toast.error("Failed to upload image");
      updateDisplay();
    }
  };

  const setUserActivity = async () => {
    try {
      const reqBody = {
        userID,
        status: "inactive",
      };

      const response = await fetch(`${link.api_link}/updateUserStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();

      if (data.ok) {
        deleteLogin();
      }
    } catch (error) {}
  };

  const deleteLogin = async () => {
    try {
      console.log("Login data removed!");
      await SecureStore.deleteItemAsync("loginData");
      router.dismissAll();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ImageBackground
      style={styles.root}
      source={{ uri: `${link.serverLink}/assets/bg5.png` }}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileIMG} onPress={pickImage}>
          <Image
            style={styles.profileImageStyle}
            source={
              success && profile
                ? { uri: profile }
                : require("../assets/user.png")
            }
          />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.userName}>{fullname.replace(/_/g, " ")}</Text>

        {/* {role.replace(/_/g, " ")} */}
        <Text style={styles.userRole}></Text>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.actions}>
          {/* <Option
            icon="notifications-outline"
            label="Notifications"
            onPress={() => router.navigate("/notif")}
          /> */}
          {/* <Option
            icon="create-outline"
            label="Edit Name"
            onPress={() => alert("Edit Name")}
          />
          <Option
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => alert("Change Password")}
          />
          <Option
            icon="mail-outline"
            label="Change Email"
            onPress={() => alert("Change Email")}
          /> */}
          <Option
            icon="log-out-outline"
            label="Logout"
            onPress={setUserActivity}
            textColor="#e53935"
          />
        </ScrollView>
      </View>
      <Container
        position="top"
        showCloseIcon={true}
        duration={1500}
        style={{ width: "200" }}
      />
    </ImageBackground>
  );
};

const Option = ({ icon, label, onPress, textColor = "#333" }) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <Ionicons
      name={icon}
      size={22}
      color={textColor}
      style={styles.optionIcon}
    />
    <Text style={[styles.optionText, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 75,
    marginTop: 100,
  },
  header: {
    alignItems: "center",
    zIndex: 2,
    marginBottom: -75,
  },
  profileIMG: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  profileImageStyle: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 90,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
    elevation: 5,
    height: 1000,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: "#777",
    marginBottom: 20,
  },
  actions: {
    width: "100%",
    marginTop: 10,
    padding: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    paddingVertical: 25,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 17,
    elevation: 2,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default Profile;
