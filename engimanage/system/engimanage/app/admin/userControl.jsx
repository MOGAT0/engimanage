// UserControl.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Button,
  RefreshControl,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import globalScript from "../globals/globalScript";

const API_URL = globalScript.api_link;

const UserControl = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [timer, setTimer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    email: "",
    pass: "",
    fname: "",
    lname: "",
    role: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [optionsPos, setOptionsPos] = useState({ x: 0, y: 0 });
  const [passwordVisibleConfirm, setPasswordVisibleConfirm] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(search);
    await fetchRoles();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUsers("");
    fetchRoles();
  }, []);

  const fetchUsers = async (query) => {
    try {
      const res = await fetch(`${API_URL}/searchUsers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/roles`, { method: "POST" });
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Debounced search
  const handleSearch = (text) => {
    setSearch(text);
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(() => fetchUsers(text), 500));
  };

  // Delete user (soft delete)
  const handleDelete = async (id, adminPass) => {
    const res = await fetch(`${API_URL}/deleteUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adminPass }),
    });
    const result = await res.json();
    alert(result.message);
    if (result.ok) fetchUsers(search);
  };

  // Restore user
  const handleRestore = async (id, adminPass) => {
    const res = await fetch(`${API_URL}/restoreUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adminPass }),
    });
    const result = await res.json();
    alert(result.message);
    if (result.ok) fetchUsers(search);
  };

  // Update user
  const submitUpdate = async (pwd) => {
    const roleObj = roles.find((r) => r.role_name === form.role);

    // Sanitize values (replace whitespace with "_")
    const sanitizedForm = {
      ...form,
      fname: form.fname ? form.fname.replace(/\s/g, "_") : "",
      lname: form.lname ? form.lname.replace(/\s/g, "_") : "",
      role: form.role ? form.role.replace(/\s/g, "_") : "",
    };

    const res = await fetch(`${API_URL}/updateUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedUser.ID,
        ...sanitizedForm,
        access_level: roleObj.grantID,
        adminPass: pwd,
      }),
    });

    const result = await res.json();
    alert(result.message);
    if (result.ok) {
      setModalVisible(false);
      fetchUsers(search);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userCard}>
      {item.profile_image ? (
        <Image
          source={{ uri: `${globalScript.serverLink}${item.profile_image}` }}
          style={[
            styles.avatar,
            {
              borderColor: item.is_deleted == 1 ? "red" : "lime",
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            {
              borderColor: item.is_deleted == 1 ? "red" : "lime",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Ionicons name="person" size={48} color={"#c2c2c2"} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Ionicons
          name="ellipse"
          color={item.status === "active" ? "green" : "red"}
          size={15}
          style={styles.statusBadge}
        />
        <Text style={styles.name}>
          {item.fname.replace(/_/g, " ")} {item.lname.replace(/_/g, " ")}
        </Text>
        <Text style={styles.role}>{item.role_name.replace(/_/g," ")}</Text>
      </View>
      <TouchableOpacity
        ref={(ref) => (item.buttonRef = ref)}
        onPress={() => {
          item.buttonRef?.measureInWindow((x, y, width, height) => {
            setOptionsPos({ x, y: y + height });
            setSelectedUser(item);
            setOptionsVisible(true);
          });
          setForm({
            email: item.email || "",
            fname: item.fname || "",
            lname: item.lname || "",
            role: item.role_name || "Select a role",
            pass: "",
            showRoles: false,
          });
        }}
      >
        <Ionicons name="ellipsis-vertical" size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Employees</Text>
        <TouchableOpacity
          onPress={() => router.navigate("../../signin/register")}
        >
          <Text style={styles.addBtn}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      {/* Search field */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color="#777"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#777"
          value={search}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          onPress={() => handleSearch("")}
        >
          <Ionicons name="close" size={20} color="#777"/>
        </TouchableOpacity>
      </View>

      {/* User List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.ID.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Options Modal */}
      <Modal
        transparent
        visible={optionsVisible}
        animationType="fade"
        onRequestClose={() => setOptionsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setOptionsVisible(false)}
        >
          <View
            style={[
              styles.optionsBox,
              {
                position: "absolute",
                top: optionsPos.y,
                left: optionsPos.x - 150,
              },
            ]}
          >
            {/* Edit Option */}
            <TouchableOpacity
              style={styles.optionBtn}
              onPress={() => {
                setOptionsVisible(false);
                setModalVisible(true);
              }}
            >
              <Ionicons name="create-outline" size={20} color="blue" />
              <Text style={styles.optionText}>Edit</Text>
            </TouchableOpacity>

            {/* Delete / Restore Option */}
            {selectedUser?.is_deleted == 1 ? (
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => {
                  setOptionsVisible(false);
                  setPendingAction("restore");
                  setPasswordConfirmVisible(true);
                }}
              >
                <Ionicons name="refresh" size={20} color="green" />
                <Text style={styles.optionText}>Restore</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => {
                  setOptionsVisible(false);
                  setPendingAction("delete");
                  setPasswordConfirmVisible(true);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="red" />
                <Text style={styles.optionText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Password Confirm Modal */}
      <Modal transparent visible={passwordConfirmVisible} animationType="fade">
        <View style={styles.confirmBox}>
          <View style={styles.confirmInner}>
            <Text>Enter Admin Password to confirm:</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                secureTextEntry={!passwordVisibleConfirm}
                style={styles.passwordInput}
                value={adminPassword}
                onChangeText={setAdminPassword}
                placeholder="Enter admin password"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() =>
                  setPasswordVisibleConfirm(!passwordVisibleConfirm)
                }
              >
                <Ionicons
                  name={passwordVisibleConfirm ? "eye-off" : "eye"}
                  size={20}
                />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <Button
                title="Cancel"
                onPress={() => {
                  setPasswordConfirmVisible(false);
                  setAdminPassword("");
                  setPendingAction(null);
                }}
              />
              <View style={{ margin: 10 }} />
              <Button
                title="Confirm"
                onPress={() => {
                  if (pendingAction === "delete") {
                    handleDelete(selectedUser?.ID, adminPassword);
                  } else if (pendingAction === "restore") {
                    handleRestore(selectedUser?.ID, adminPassword);
                  } else if (pendingAction === "update") {
                    submitUpdate(adminPassword);
                  }
                  setPasswordConfirmVisible(false);
                  setAdminPassword("");
                  setPendingAction(null);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.updateOverlay}>
          <View style={styles.updateCard}>
            <Text style={styles.modalTitle}>Update User</Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
              placeholder="Enter email"
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={form.pass}
                secureTextEntry={!passwordVisible}
                onChangeText={(t) => setForm({ ...form, pass: t })}
                placeholder="Enter password"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={20}
                />
              </TouchableOpacity>
            </View>

            {/* First Name */}
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={form.fname.replace(/_/g," ")}
              onChangeText={(t) => setForm({ ...form, fname: t })}
              placeholder="Enter first name"
            />

            {/* Last Name */}
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={form.lname.replace(/_/g," ")}
              onChangeText={(t) => setForm({ ...form, lname: t })}
              placeholder="Enter last name"
            />

            {/* Role Dropdown */}
            <Text style={styles.label}>Role</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setForm({ ...form, showRoles: !form.showRoles })}
            >
              <Text style={{ color: form.role ? "#000" : "#777" }}>
                {form.role.replace(/_/g," ") || "Select a role"}
              </Text>
              <Ionicons
                name={form.showRoles ? "chevron-up" : "chevron-down"}
                size={18}
              />
            </TouchableOpacity>
            {form.showRoles && (
              <View style={styles.dropdownList}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r.grantID}
                    style={styles.dropdownItem}
                    onPress={() =>
                      setForm({
                        ...form,
                        role: r.role_name,
                        showRoles: false,
                      })
                    }
                  >
                    <Text>{r.role_name.replace(/_/g," ")}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  setPendingAction("update");
                  setPasswordConfirmVisible(true);
                }}
              >
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserControl;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    height: 40,
    borderRadius: 8,
    backgroundColor: "#D9E8D8",
    paddingHorizontal: 10,
    marginVertical: 15,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0d0c22",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
  },
  addBtn: {
    color: "white",
    fontWeight: "bold",
    backgroundColor: "blue",
    padding: 11,
    borderRadius: 50,
    paddingHorizontal: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 0.3,
    borderColor: "#c2c2c2",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    overflow: "hidden",
    borderColor: "#c2c2c2",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  role: {
    fontSize: 14,
    color: "gray",
  },
  statusBadge: {
    position: "absolute",
    marginLeft: -23,
    marginTop: -5,
    borderWidth: 2,
    borderRadius: 100,
    borderColor: "white",
    backgroundColor: "white",
    width: 18,
    height: 19,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0)",
  },
  optionsBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    width: 200,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  confirmBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },
  confirmInner: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "80%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginVertical: 5,
    width: "100%",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 3,
    borderRadius: 5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  optionsBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    width: 150,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  updateOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },
  updateCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    color: "#c2c2c2",
    fontSize: 15,
    textAlign: "center",
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 5,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 8,
  },
  eyeIcon: {
    padding: 5,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});
