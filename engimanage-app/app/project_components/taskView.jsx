import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import CustomHeader from "../components/customHeader";
import DataSecureStorage from "../components/DataSecureStorage";

import globalScript from "../globals/globalScript";
const link = globalScript;

const TaskView = () => {
  const [taskData, setTaskData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fetchedFiles, setFetchedFiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [userInfo, setUserInfo] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);

  const { task_id } = useLocalSearchParams();

  useEffect(() => {
    getuserInfo();
  }, [userInfo]);

  const getuserInfo = async () => {
    const data = await DataSecureStorage.getItem("loginData");
    if (data) {
      const info = JSON.parse(data);
      setUserInfo(info);
    }
  };

  const get_taskInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${link.api_link}/getTaskInfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id }),
      });
      const data = await response.json();

      if (data.ok) {
        setTaskData(data.data || null);

        // console.log("$#$#$#$#$#");
        // console.log(data.data);
        // console.log("$#$#$#$#$#");
      } else {
        console.log("Error fetching task info:", data.message);
      }
    } catch (error) {
      console.log("Error fetching task info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    get_taskInfo();
    fetchUploadedImages();
  }, []);

  // File Picker
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/png", "image/jpeg"],
        multiple: true,
      });

      if (result.canceled) return;

      // Combine old and new files immediately
      const newFiles = [...uploadedFiles, ...result.assets];

      // Update state
      setUploadedFiles(newFiles);

      console.log("Picked files:", result.assets);
    } catch (err) {
      console.error("Error picking file:", err);
    }
  };

  const uploadFilesToServer = async (filesToUpload = []) => {
    if (filesToUpload.length === 0) {
      Alert.alert("No files selected", "Please select at least one file.");
      return;
    }

    const formData = new FormData();
    formData.append("task_id", task_id);

    filesToUpload.forEach((file) => {
      formData.append("files", {
        uri: file.uri,
        type: file.mimeType || "image/jpeg",
        name: file.name || `file-${Date.now()}.jpg`,
      });
    });

    try {
      setIsLoading(true);

      const res = await fetch(`${link.api_link}/uploadTaskFiles`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await res.json();

      if (data.ok) {
        Alert.alert("Success", "Files uploaded successfully!");
        console.log("Server response:", data);
        fetchUploadedImages();
        setUploadedFiles([]);
      } else {
        Alert.alert("Error", data.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "An error occurred during upload.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch uploaded images for this task
  const fetchUploadedImages = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`${link.api_link}/getTaskFiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task_id }),
      });

      const data = await res.json();

      if (data.ok && Array.isArray(data.data) && data.data.length > 0) {
        const formattedFiles = data.data.map((file) => ({
          uri: `${link.serverLink}/${file.file_path}`,
          name: file.original_name,
          mimeType: file.mime_type,
          id: file.id,
        }));

        setFetchedFiles(formattedFiles);
        console.log("Fetched uploaded images:", formattedFiles);
      } else {
        console.log("No uploaded images found for this task.");
        setFetchedFiles([]); // clear in case no data
      }
    } catch (err) {
      console.error("Error fetching uploaded images:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitWork = async () => {
    try {
      const response = await fetch(`${link.api_link}/updateTask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task_id, progress: 100 }),
      });

      const data = await response.json();

      if (data.ok) {
        Alert.alert("Success", "Task Submitted Successfully!");
        evaluate_employee();
        router.back();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const evaluate_employee = async () => {
    try {
      const response = await fetch(`${link.api_link}/employee_evaluation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.ok) {
        console.log(data.message);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handle_openComment = () => {
    const matchedTask = taskData?.find((task) => task.ID == task_id);

    if (matchedTask) {
      router.navigate({
        pathname: "project_components/taskComments",
        params: { taskData: JSON.stringify(matchedTask) },
      });
    } else {
      console.warn("No matching task found for task_id:", task_id);
    }
  };

  // if(taskData){
  //   console.log(
  //       taskData.find(task => task.employeeID === userInfo.ID));
  // }
  // 
  // console.log("_-_-_-_")
  // console.log(taskData)
  // console.log("_-_-_-_")
  return (
    <View style={styles.container}>
      <CustomHeader title={taskData?.find((task) => task.ID == task_id)?.label || "loading..."} />

      <ScrollView
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {taskData &&
        taskData.length > 0 &&
        taskData.some((task) => task.assign_status !== "available") ? (
          <>
            <Text
              style={[
                styles.assignedText,
                { fontSize: 15, fontWeight: "bold" },
              ]}
            >
              Deadline:
            </Text>
            <View style={styles.row}>
              <View style={styles.deadlineBox}>
                <Ionicons name="calendar-outline" size={18} color="#555" />
                <Text style={styles.deadlineText}>{taskData?.find((task) => task.ID == task_id)?.task_deadline || "loading..."}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handle_openComment}
              style={{
                justifyContent: "flex-start",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Ionicons
                name="chatbox-ellipses-outline"
                color={"blue"}
                size={22}
              />
              <Text style={styles.commentDesign}> Comments</Text>
            </TouchableOpacity>

            <LinearGradient
              colors={(() => {
                const task = taskData?.find((task) => task.ID == task_id);
                if (!task) return ["#9e9e9e", "#757575"];
                if (task.progress === 100) return ["#4caf50", "#2e7d32"];
                if (task.progress === 0 && task.completion_status === "overdue")
                  return ["#f44336", "#d32f2f"];
                return ["#ff9800", "#f57c00"];
              })()}
              style={styles.statusCard}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: (() => {
                      const task = taskData?.find((task) => task.ID == task_id);
                      if (!task) return "#ffffff";
                      if (task.progress === 100) return "#ffffff";
                      if (
                        task.progress === 0 &&
                        task.completion_status === "overdue"
                      )
                        return "#ffffff";
                      return "#ffffff";
                    })(),
                  },
                ]}
              >
                {(() => {
                  const task = taskData?.find((task) => task.ID == task_id);
                  if (!task) return "Task not found"; // optional
                  if (task.progress === 100) return "Completed";
                  if (
                    task.progress === 0 &&
                    task.completion_status === "overdue"
                  )
                    return "Overdue";
                  return "In Progress";
                })()}
              </Text>
            </LinearGradient>

            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionHeader}>Description</Text>
              <Text style={styles.descriptionText}>
                {taskData?.find((task) => task.ID == task_id)
                  ?.task_description || "No description"}
              </Text>
            </View>
            {/* display images */}
            <View
              style={{
                backgroundColor: "#dfdfdfff",
                marginTop: 40,
                padding: 10,
                borderRadius: 10,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                paddingBottom: 100,
              }}
            >
              <Text style={{ marginBottom: 20, width: "100%" }}>
                Attached Progress Files
              </Text>

              {fetchedFiles.length > 0 ? (
                fetchedFiles.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      width: "30%", // 3 per row
                      aspectRatio: 1,
                      marginBottom: 10,
                    }}
                    onPress={() => {
                      if (item.uri) {
                        setSelectedImageUri(item.uri);
                        setImageModalVisible(true);
                      }
                    }}
                  >
                    {item.uri ? (
                      <Image
                        source={{ uri: item.uri }}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 8,
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={{
                          backgroundColor: "#ccc",
                          justifyContent: "center",
                          alignItems: "center",
                          flex: 1,
                          borderRadius: 8,
                        }}
                      >
                        <Ionicons
                          name="document-outline"
                          size={24}
                          color="#555"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text
                  style={{ color: "#666", textAlign: "center", width: "100%" }}
                >
                  No files uploaded
                </Text>
              )}
            </View>
          </>
        ) : (
          <>
            <Text
              style={[
                styles.assignedText,
                { fontSize: 15, fontWeight: "bold" },
              ]}
            >
              Deadline:
            </Text>
            <View style={styles.row}>
              <View style={styles.deadlineBox}>
                <Ionicons name="calendar-outline" size={18} color="#555" />
                <Text style={styles.deadlineText}>{taskData?.find((task) => task.ID == task_id)?.task_deadline || "loading..."}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handle_openComment}
              style={{
                justifyContent: "flex-start",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Ionicons
                name="chatbox-ellipses-outline"
                color={"blue"}
                size={22}
              />
              <Text style={styles.commentDesign}> Comments</Text>
            </TouchableOpacity>

            <LinearGradient
              colors={["#c75e5eff", "#dd0b0bff"]}
              style={styles.statusCard}
            >
              <Text style={styles.notAssigned}>Not assigned</Text>
            </LinearGradient>

            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionHeader}>Description</Text>
              <Text style={styles.descriptionText}>
                {taskData?.find((task) => task.ID == task_id)
                  ?.task_description || "No description"}
              </Text>
            </View>
          </>
        )}

        {/* Slide Up Modal */}
        <Modal
          animationType="slide"
          visible={modalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close-circle" size={25} color="#c40000ff" />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.modalTitle}>To be Uploaded</Text>

                <TouchableOpacity style={styles.addFileBtn} onPress={pickFile}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={24}
                    color="black"
                  />
                  <Text> Upload File</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={uploadedFiles}
                numColumns={3}
                keyExtractor={(item, index) => index.toString()}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                renderItem={({ item, index }) => (
                  <View
                    style={{ width: "30%", aspectRatio: 1, marginBottom: 10 }}
                  >
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        zIndex: 10,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: 12,
                        padding: 2,
                      }}
                      onPress={() =>
                        setUploadedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <Ionicons name="trash-outline" size={18} color="#fff" />
                    </TouchableOpacity>

                    <Image
                      source={{ uri: item.uri }}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 10,
                        backgroundColor: "#ccc",
                        borderWidth:1,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                )}
                ListEmptyComponent={
                  <Text
                    style={{
                      color: "#666",
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    No files uploaded
                  </Text>
                }
              />

              <TouchableOpacity
                style={styles.done_btn}
                onPress={() => {
                  setModalVisible(false);
                  uploadFilesToServer(uploadedFiles);
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Upload Files
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {isLoading && (
          <Modal>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#332277" />
            </View>
          </Modal>
        )}

        {/* expand image */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{ position: "absolute", top: 40, right: 20 }}
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close-circle" size={35} color="#fff" />
            </TouchableOpacity>

            {selectedImageUri && (
              <Image
                source={{ uri: selectedImageUri }}
                style={{
                  width: "90%",
                  height: "70%",
                  borderRadius: 12,
                }}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </ScrollView>

      {/* Bottom Work Area */}
      {taskData &&
        taskData.some(
          (task) =>
            task.employeeID == userInfo.ID &&
            task.progress <= 0 &&
            task.completion_status !== "overdue"
        ) && (
          <View style={styles.bottomBar}>
            {/* Caret-up icon to open modal */}
            <TouchableOpacity
              style={styles.caretBtn}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="caret-up" size={22} color="#333" />
            </TouchableOpacity>

            {/* Always show Add Work */}
            <TouchableOpacity
              style={styles.addWorkBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addWorkText}>+ Add work</Text>
            </TouchableOpacity>

            {/* Show Submit only if files uploaded */}
            {fetchedFiles.length > 0 && (
              <TouchableOpacity style={styles.submitBtn} onPress={submitWork}>
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
    </View>
  );
};

export default TaskView;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  taskLabel: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  assignedText: { fontSize: 16, color: "#444" },
  deadlineBox: { flexDirection: "row", alignItems: "center" },
  deadlineText: { fontSize: 14, marginLeft: 5, color: "#555" },
  statusCard: {
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 20,
    alignItems: "center",
    elevation: 4,
  },
  statusText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  descriptionBox: { marginTop: 10 },
  descriptionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
    textAlign: "justify",
  },
  notAssigned: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "110%",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    paddingBottom: 70,
  },
  addWorkBtn: {
    backgroundColor: "#a0c4ff",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  addWorkText: { color: "#00296b", fontWeight: "bold" },
  submitBtn: {
    backgroundColor: "#4caf50",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    marginTop: 15,
  },
  submitText: { color: "#fff", fontWeight: "bold" },
  done_btn: {
    backgroundColor: "#03b7ffff",
    padding: 10,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  caretBtn: {
    padding: 10,
    borderRadius: 20,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -10,
    marginBottom: 10,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "70%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  closeBtn: {
    alignItems: "center",
    padding: 6,
    marginBottom: 15,
    marginTop: -15,
  },
  closeText: { color: "red", fontWeight: "bold" },
  addFileBtn: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  commentDesign: {
    color: "blue",
    marginVertical: 10,
    fontSize: 17,
  },
});
