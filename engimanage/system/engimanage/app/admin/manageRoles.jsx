import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import globalScript from "../globals/globalScript";

const link = globalScript;

const ManageRoles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]); // all permissions
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [permissionID, setPermissionID] = useState(""); // selected permissionID
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionKey, setPermissionKey] = useState("view");

  // fetch roles
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${link.api_link}/getRoles`, { method: "POST" });
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.log(err);
    }
  };

  // fetch permissions
  const fetchPermissions = async () => {
    try {
      const res = await fetch(`${link.api_link}/getPermissions`, {
        method: "POST",
      });
      const data = await res.json();
      setPermissions(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoles();
    await fetchPermissions();
    setExpanded(null);
    setRefreshing(false);
  };

  // add role
  const handleAddRole = async (newRole) => {
    try {
      const payload = {
        role_name: newRole.role_name,
        permission_key: newRole.permission_key,
        notes: newRole.notes || "",
      };

      const response = await fetch(`${link.api_link}/addRole`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.ok) {
        setRoles((prev) => [...prev, data.role]);
        fetchRoles();
        setExpanded(null);
        setModalVisible(false);
      } else {
        Alert.alert("Error", data.message || "Failed to add role");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // update role
  const handleUpdateRole = async (updatedRole) => {
    try {
      const payload = {
        grantID: updatedRole.grantID,
        role_name: updatedRole.role_name,
        permission_key: updatedRole.permission_key,
        notes: updatedRole.notes || "",
      };

      const response = await fetch(`${link.api_link}/updateRole`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // safe now
      });

      const data = await response.json();

      if (data.ok) {
        setRoles((prev) =>
          prev.map((r) => (r.grantID === payload.grantID ? data.role : r))
        );
        fetchRoles();
        setExpanded(null);
        setEditModalVisible(false);
      } else {
        Alert.alert("Error", data.message || "Failed to update role");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Delete Role
  const confirmDeleteRole = (grantID) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this role?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteRole(grantID),
        },
      ]
    );
  };

  const handleDeleteRole = async (grantID) => {
    try {
      const res = await fetch(`${link.api_link}/deleteRole`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grantID }),
      });
      const data = await res.json();
      if (data.ok) {
        setRoles(roles.filter((r) => r.grantID !== grantID));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Manage Roles</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setRoleName("");
          setPermissionID("");
          setNote("");
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Add Role</Text>
      </TouchableOpacity>

      {/* Role List */}
      <FlatList
        data={roles.sort((a, b) => a.grantID - b.grantID)}
        keyExtractor={(item) => item.grantID.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={1} onPress={() => setExpanded(null)}>
            <View style={styles.roleCard}>
              <View style={{ flex: 1 }}>
                {item.role_name && (
                  <Text style={styles.roleText}>
                    <Text style={styles.bold}>Role:</Text>{" "}
                    {item.role_name.replace(/_/g, " ")}
                  </Text>
                )}

                {item.permission_key && (
                  <Text style={styles.roleText}>
                    <Text style={styles.bold}>Permission:</Text>{" "}
                    {item.permission_key.replace(/_/g, "/")}
                  </Text>
                )}

                {item.notes && (
                  <Text style={styles.roleText}>
                    <Text style={styles.bold}>Description:</Text> {item.notes}
                  </Text>
                )}
              </View>

              {expanded === item.grantID ? (
                <View style={styles.actionGroup}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setEditModalVisible(true);
                      setSelectedRole(item);
                      setRoleName(item.role_name.replace(/_/g, " "));
                      setPermissionKey(item.permission_key);
                      setNote(item.notes);
                      setPermissionID(item.permissionID);
                      console.log(item);
                    }}
                  >
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "red" }]}
                    onPress={() => confirmDeleteRole(item.grantID)}
                  >
                    <Text style={styles.actionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setExpanded(item.grantID)}>
                  <Ionicons name="create-outline" size={28} color="#aa2222" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add Role Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Role Name"
              value={roleName}
              onChangeText={setRoleName}
            />

            <TextInput
              style={styles.input}
              placeholder="Note"
              value={note}
              onChangeText={setNote}
            />

            <View style={styles.permissionContainer}>
              <Text style={styles.permissionLabel}>Select Permission</Text>

              {/* Options */}
              {permissions.map((p) => (
                <TouchableOpacity
                  key={p.permissionID}
                  style={[
                    styles.permissionOption,
                    permissionID === p.permission_key &&
                      styles.permissionOptionSelected,
                  ]}
                  onPress={() => setPermissionID(p.permission_key)}
                >
                  {/* Radio Icon */}
                  <Ionicons
                    name={
                      permissionID === p.permission_key
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={
                      permissionID === p.permission_key ? "#007bff" : "#555"
                    }
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    style={[
                      styles.permissionText,
                      permissionID === p.permission_key &&
                        styles.permissionTextSelected,
                    ]}
                  >
                    {p.permission_key.replace(/_/g, " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                handleAddRole({
                  role_name: roleName,
                  permission_key: permissionID,
                  notes: note,
                });
                console.log(permissionKey);
              }}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Role Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Role Name"
              value={roleName}
              onChangeText={setRoleName}
            />
            <TextInput
              style={styles.input}
              placeholder="Note"
              value={note}
              onChangeText={setNote}
            />

            {/* <View style={styles.permissionBtn}>
              <Picker
                selectedValue={permissionID}
                onValueChange={(value) => setPermissionID(value)}
              >
                <Picker.Item
                  label="-- Select Permission --"
                  value=""
                  color="#c2c2c2"
                />
                {permissions.map((p) => (
                  <Picker.Item
                    key={p.permissionID}
                    label={p.permission_key} // readable
                    value={p.permissionID} // ID stored
                  />
                ))}
              </Picker>
            </View> */}

            <View style={styles.permissionContainer}>
              <Text style={styles.permissionLabel}>Select Permission</Text>

              {permissions.map((p) => (
                <TouchableOpacity
                  key={p.permissionID}
                  style={[
                    styles.permissionOption,
                    permissionID === p.permissionID &&
                      styles.permissionOptionSelected,
                  ]}
                  onPress={() => setPermissionID(p.permissionID)}
                >
                  {/* Radio Icon */}
                  <Ionicons
                    name={
                      permissionID === p.permissionID
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={permissionID === p.permissionID ? "#aa2222" : "#555"}
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    style={[
                      styles.permissionText,
                      permissionID === p.permissionID &&
                        styles.permissionTextSelected,
                    ]}
                  >
                    {p.permission_key.replace(/_/g, " ")} {/* readable label */}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() =>
                handleUpdateRole({
                  grantID: selectedRole.grantID,
                  role_name: roleName,
                  permission_key: permissionID, // send ID
                  notes: note,
                })
              }
            >
              <Text style={styles.saveButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManageRoles;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#393E46", // keep base dark bg
  },
  titleText: {
    marginTop: 20,
    marginBottom: 15,
    fontSize: 25,
    fontWeight: "bold",
    color: "#EEEEEE", // brighter white for headings
  },
  addButton: {
    backgroundColor: "#aa2222",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: "#EEEEEE",
    fontWeight: "bold",
    fontSize: 16,
  },
  roleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#222831", // dark card
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#444", // subtle border
  },
  roleText: {
    fontSize: 15,
    marginBottom: 6,
    color: "#EEEEEE", // readable on dark
  },
  bold: { fontWeight: "bold", color: "#FFD369" }, // highlight bold parts
  actionGroup: { flexDirection: "row" },
  actionButton: {
    backgroundColor: "#00ADB5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 6,
  },
  actionText: { color: "#EEEEEE", fontWeight: "600" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: "#222831",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    borderWidth: 1,
    borderColor: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: "#2d2d2d",
    color: "#EEEEEE",
    padding: 12,
    marginBottom: 14,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "#aa2222",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#EEEEEE",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#EEEEEE",
    fontWeight: "bold",
  },
  permissionContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    backgroundColor: "#2d2d2d",
  },
  permissionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#FFD369",
  },
  permissionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  permissionOptionSelected: {
    backgroundColor: "#393E46",
    borderRadius: 6,
  },
  permissionText: {
    fontSize: 14,
    color: "#EEEEEE",
  },
  permissionTextSelected: {
    fontWeight: "600",
    color: "#00ADB5",
  },
});
