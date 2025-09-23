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
} from "react-native";
import React, { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import globalScript from "../globals/globalScript";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import CustomHeader from "../components/customHeader";

const link = globalScript;

const ProjectFiles = ({ projectID, homeRoute }) => {
  const [items, setItems] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [pathHistory, setPathHistory] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
      console.log("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  const openFolder = (folder) => {
    setPathHistory([...pathHistory, currentPath]);
    setCurrentPath(folder.path);
  };

  const openFile = async (fileUrl) => {
    try {
      setFileLoading(true);
      // Build encoded URL
      const encodedUrl = encodeURI(`${link.serverLink}/projectfiles${fileUrl}`);
      console.log("Downloading from:", encodedUrl);

      // Extract file name
      const fileName = fileUrl.split("/").pop();

      // Local path inside app sandbox
      const localFile = `${FileSystem.documentDirectory}${fileName}`;
      console.log("Saving to:", localFile);

      // Download the file
      const { uri } = await FileSystem.downloadAsync(encodedUrl, localFile);

      // Get content URI (needed for Android)
      const contentUri = await FileSystem.getContentUriAsync(uri);

      // Open with system viewer (Android only here)
      if (Platform.OS === "android") {
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
        });
      } else {
        // On iOS, Linking can handle it
        await Linking.openURL(uri);
      }
    } catch (error) {
      console.log("Error opening file:", error);
    } finally {
      setFileLoading(false);
    }
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
      console.log("Error creating folder:", err);
    }

    setNewFolderName("");
    setFolderModalVisible(false);
  };

  const uploadFiles = async () => {
    try {
      // Pick documents
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: [
          "image/png",
          "image/jpeg",
          "text/plain",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (result.canceled) return;

      const files = result.assets || [];
      if (files.length === 0) return;

      // Prepare FormData
      const formData = new FormData();
      files.forEach((file) => {
        const isImage = file.mimeType?.startsWith("image/");
        const fileCategory = isImage ? "image" : "file";

        formData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        });
        formData.append("fileType", fileCategory);
      });

      // Include current path (optional)
      formData.append("saveFilePath", currentPath || "/");

      // POST request
      const res = await fetch(`${link.api_link}/uploadfiles`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.ok !== false) {
        console.log("Upload success:", data);
        fetchFiles(currentPath);
      } else {
        console.log("Upload failed:", data.message || "Unknown error");
        Alert.alert(
          "Warning",
          "Upload failed:",
          data.message || "Unknown error"
        );
      }
    } catch (err) {
      console.log("File upload error:", err);
      Alert.alert("Upload Failed",err.message || "")
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Project Files"
        routePath={homeRoute}
        backName="Home"
      />
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
              onPress={() => {
                item.type === "folder" ? openFolder(item) : openFile(item.url);
                // : router.navigate({ // open file
                //     pathname: "project_components/filePage",
                //     params: { fileUrl: item.url },
                //   })
              }}
              onLongPress={() => {
                setSelectedItem(item);
                setOptionModalVisible(true);
              }}
            >
              <Ionicons
                name={
                  item.type === "folder"
                    ? "folder"
                    : item.type === "image"
                    ? "image-outline"
                    : "document-text"
                }
                size={28}
                color={
                  item.type === "folder"
                    ? "#FFD700"
                    : item.type === "image"
                    ? "#c02c2cff"
                    : "#5037cdff"
                }
                style={styles.icon}
              />

              <Text style={styles.folderText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      {fileLoading && (
        <View style={styles.fileLoadingOverlay}>
          <ActivityIndicator size="large" color="#331177" />
          <Text style={{ marginTop: 10, color: "#331177", fontWeight: "600" }}>
            Opening file...
          </Text>
        </View>
      )}

      {/* options modal */}
      <Modal
        transparent={true}
        visible={optionModalVisible}
        animationType="fade"
        onRequestClose={() => setOptionModalVisible(false)}
      >
        <View style={styles.actionsModalOverlay} onPress={()=> {setOptionModalVisible(false)}} >
          <View style={styles.optionModal}>
            <Text style={styles.modalTitle}>Options</Text>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                /* handle copy */
              }}
            >
              <Ionicons
                name="copy-outline"
                size={20}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.optionText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                /* handle move */
              }}
            >
              <Ionicons
                name="move-outline"
                size={20}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.optionText}>Move</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                /* handle rename */
              }}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.optionText}>Rename</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                /* handle delete */
              }}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color="#ff5555"
                style={styles.icon}
              />
              <Text style={[styles.optionText, { color: "#ff5555" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    padding: 10,
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
  fileLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionModal: {
    width: "100%",
    backgroundColor: "#1e1e1e",
    borderTopStartRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  actionsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ccc",
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 15,
    color: "#fff",
  },
  icon: {
    marginRight: 10,
  },
});
