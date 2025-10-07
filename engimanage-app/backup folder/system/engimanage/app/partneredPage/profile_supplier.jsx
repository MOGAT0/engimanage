import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

const Profile_supplier = () => {
  const [editMode, setEditMode] = useState(false);
  const [companyName, setCompanyName] = useState("My Company Inc.");
  const [contactNumber, setContactNumber] = useState("09123456789");
  const [contactEmail, setContactEmail] = useState("contact@company.com");
  const [companyWebsite, setCompanyWebsite] = useState("https://mycompany.com");
  const [taxID, setTaxID] = useState("123-456-789");
  const [companyLogo, setCompanyLogo] = useState("https://via.placeholder.com/100");

  const toggleEdit = () => {
    if (editMode) {
      console.log("Saving profile...");
      // Save to backend
    }
    setEditMode(!editMode);
  };

  const pickImage = async () => {
    if (!editMode) return;
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      base64:false,
    });
    if (!result.canceled) {
      setCompanyLogo(result.assets[0].uri);
    }
  };

  const renderField = (label, value, onChange, keyboardType = "default") => (
    <View style={styles.listItem}>
      <Text style={styles.label}>{label}</Text>
      {editMode ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={toggleEdit} style={styles.editButton}>
          <Ionicons name={editMode ? "save-outline" : "create-outline"} size={22} color="#fff" />
          <Text style={styles.editText}>{editMode ? "Save" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <TouchableOpacity style={styles.logoContainer} onPress={pickImage} activeOpacity={editMode ? 0.7 : 1}>
        <Image source={{ uri: companyLogo }} style={styles.logo} />
        {editMode && (
          <View style={styles.uploadButton}>
            <Ionicons name="camera-outline" size={50} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Fields */}
      <View style={styles.form}>
        {renderField("Company Name", companyName, setCompanyName)}
        {renderField("Contact Number", contactNumber, setContactNumber, "phone-pad")}
        {renderField("Contact Email", contactEmail, setContactEmail, "email-address")}
        {renderField("Company Website", companyWebsite, setCompanyWebsite)}
        {renderField("Tax ID", taxID, setTaxID)}
      </View>
    </View>
  );
};

export default Profile_supplier;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  editText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "bold",
  },
  logoContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 150,
    borderWidth:3,
    borderColor:"#c2c2c2"
  },
  uploadButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    padding: 6,
    borderRadius: 50,
    elevation: 2,
  },
  form: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  listItem: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#000",
    paddingVertical: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
});
