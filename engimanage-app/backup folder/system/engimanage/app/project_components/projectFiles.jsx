import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import React, { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import globalScript from "../globals/globalScript";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

const link = globalScript;

const ProjectFiles = () => {
  const [items, setItems] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [pathHistory, setPathHistory] = useState([]);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (path = "") => {
    try {
      setLoading(true);
      const res = await fetch(
        `${link.api_link}/files${
          path ? `?path=${encodeURIComponent(path)}` : ""
        }`
      );
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  const openFolder = (folder) => {
    setPathHistory([...pathHistory, currentPath]);
    setCurrentPath(folder.path);
  };

  const goBack = () => {
    const prevPath = pathHistory[pathHistory.length - 1] || "";
    setPathHistory(pathHistory.slice(0, -1));
    setCurrentPath(prevPath);
  };

  const saveFolder = async () => {
    if (newFolderName.trim() === "") return;

    try {
      const res = await fetch(`${link.api_link}/create-folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: currentPath, name: newFolderName }),
      });

      const data = await res.json();

      if (data.ok) {
        fetchFiles(currentPath);
        
      } else {
        Alert.alert("Error", data.message);
      }

      fetchFiles(currentPath);
    } catch (err) {
      console.error("Error creating folder:", err);
    }

    setNewFolderName("");
    setFolderModalVisible(false);
  };


  // const uploadFiles = async () => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       multiple: true,
  //       type: "*/*",
  //     });

  //     if (result.canceled) return;
  //     const files = result.assets || [];
  //     if (!files.length) return;

  //     const formData = new FormData();

  //     files.forEach((file) => {
  //       formData.append("files", {
  //         uri: file.uri,
  //         name: file.name,
  //         type: file.mimeType || "application/octet-stream",
  //       });
  //     });

  //     // send current path
  //     formData.append("path", currentPath);

  //     console.log(currentPath);
      

  //     const res = await fetch(`${link.api_link}/uploadfiles`, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //       },
  //       body: formData,
  //     });

  //     const data = await res.json();

  //     if (res.ok && data.ok) {
  //       console.log("Upload success:", data);
  //       fetchFiles(currentPath); // refresh list
  //     } else {
  //       console.error("Upload failed:", data.message || "Unknown error");
  //     }
  //   } catch (err) {
  //     console.error("File upload error:", err);
  //   }
  // };

  const uploadFiles = async () => {
    try {
      // Pick documents
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: "*/*",
      });

      if (result.canceled) return;

      const files = result.assets || [];
      if (files.length === 0) return;

      // Prepare FormData
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        });
      });

      // Include current path (optional)
      formData.append("path", currentPath || "/");

      // POST request
      const res = await fetch(`${link.api_link}/uploadfiles`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
      
      const data = await res.json();
      
      console.log("=====================");
      console.log(formData);
      console.log("=====================");
      
      if (res.ok && data.ok !== false) {
        console.log("Upload success:", data);
        fetchFiles(currentPath);
      } else {
        console.error("Upload failed:", data.message || "Unknown error");
      }
    } catch (err) {
      console.error("File upload error:", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button + Path */}
      {currentPath !== "" && (
        <View style={{ marginBottom: 12 }}>
          {/* Current Path on Top */}
          <Text style={styles.pathText}>/ {currentPath}</Text>

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Ionicons name="arrow-undo" size={20} color="#331177" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Folder/File List */}
      {loading ? (
        <ActivityIndicator size="large" color="#331177" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.folderItem}
              onPress={() =>
                item.type === "folder"
                  ? openFolder(item)
                  : router.push({
                      pathname: "project_components/filePage",
                      params: { fileUrl: item.url },
                    })
              }
            >
              <Ionicons
                name={item.type === "folder" ? "folder" : "document"}
                size={28}
                color={item.type === "folder" ? "#FFD700" : "#555"}
                style={styles.icon}
              />
              <Text style={styles.folderText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Action Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.actionModal}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setModalVisible(false);
                uploadFiles();
              }}
            >
              <Ionicons name="cloud-upload" size={22} color="#331177" />
              <Text style={styles.actionText}>Upload Files</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setModalVisible(false);
                setFolderModalVisible(true);
              }}
            >
              <Ionicons name="folder" size={22} color="#331177" />
              <Text style={styles.actionText}>Create Folder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={22} color="red" />
              <Text style={[styles.actionText, { color: "red" }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Folder Modal */}
      <Modal visible={folderModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Folder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter folder name"
              value={newFolderName}
              onChangeText={setNewFolderName}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={saveFolder}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setFolderModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProjectFiles;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: {
    marginRight: 10,
  },
  folderText: {
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backText: {
    color: "#331177",
    marginLeft: 4,
    fontSize: 16,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#331177",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionModal: {
    width: "75%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    elevation: 6,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#331177",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#aaa",
  },
  saveButton: {
    backgroundColor: "#331177",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pathText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
});
