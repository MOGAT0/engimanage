import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import globalScript from "../engimanage/app/globals/globalScript";
import * as DocumentPicker from "expo-document-picker";

const link = globalScript;

const ProjectFiles = () => {
  const [items, setItems] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState([]);
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
      console.log(
        `${link.api_link}/files${
          path ? `?path=${encodeURIComponent(path)}` : ""
        }`
      );
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

      if (res.ok) {
        fetchFiles(currentPath);
      }
    } catch (err) {
      console.error("Error creating folder:", err);
    }

    setNewFolderName("");
    setModalVisible(false);
  };

  const uploadFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: "*/*",
      });

      if (result.type === "cancel") return;

      const files = Array.isArray(result) ? result : [result];

      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        });
      });

      formData.append("path", currentPath);

      const res = await fetch(`${link.api_link}/uploadfiles`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        fetchFiles(currentPath);
      } else {
        console.error("Upload failed:", res.status);
      }
    } catch (err) {
      console.error("File upload error:", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      {currentPath !== "" && (
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color="#331177" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
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

      {/* Add Folder Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Folder</Text>
      </TouchableOpacity>

      {/* Modal for Folder Name */}
      <Modal visible={modalVisible} transparent animationType="fade">
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
                onPress={saveFolder} // create folder
              >
                <Text style={styles.buttonText}>Create Folder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={uploadFiles} // upload files
              >
                <Text style={styles.buttonText}>Upload Files</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#331177",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
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
});
