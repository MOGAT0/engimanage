import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
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
  const [modalVisible, setModalVisible] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [userInfo, setUserInfo] = useState([]);

  const { label, task_deadline, task_id } = useLocalSearchParams();

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
      const response = await fetch(`${link.api_link}/getTaskInfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id }),
      });
      const data = await response.json();

      if (data.ok) {
        setTaskData(data.data || null);

        console.log("$#$#$#$#$#");
        console.log(data.data);
        console.log("$#$#$#$#$#");
      } else {
        console.log("Error fetching task info:", data.message);
      }
    } catch (error) {
      console.log("Error fetching task info:", error);
    }
  };

  useEffect(() => {
    get_taskInfo();
  }, []);

  // File Picker
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setUploadedFiles((prev) => [...prev, ...result.assets]);
      }

      console.log(result);
    } catch (err) {
      console.error("Error picking file:", err);
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
        Alert.alert("Success","Task Submitted Successfully!")
        evaluate_employee();
        router.back();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const evaluate_employee = async ()=>{
    try {
      const response = await fetch(`${link.api_link}/employee_evaluation`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({})
      });

      const data = await response.json();

      if(data.ok){
        // alert(data.message);
        
      }else{
        console.log(data.message);
        
      }

    } catch (error) {
      console.log(error);
      
    }
  }


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
  //       taskData.some(task => task.employeeID === userInfo.ID));
  // }

  return (
    <View style={styles.container}>
      <CustomHeader title={label} />

      {taskData &&
      taskData.length > 0 &&
      taskData.some((task) => task.assign_status !== "available") ? (
        <>
          <Text
            style={[styles.assignedText, { fontSize: 15, fontWeight: "bold" }]}
          >
            Deadline:
          </Text>
          <View style={styles.row}>
            <View style={styles.deadlineBox}>
              <Ionicons name="calendar-outline" size={18} color="#555" />
              <Text style={styles.deadlineText}>{task_deadline}</Text>
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
            colors={
              taskData?.find((task) => task.ID == task_id)?.progress === 100
                ? ["#4caf50", "#2e7d32"]
                : ["#ff9800", "#f57c00"]
            }
            style={styles.statusCard}
          >
            <Text style={styles.statusText}>
              {taskData?.find((task) => task.ID == task_id)?.progress === 100
                ? "Completed"
                : "In Progress"}
            </Text>
          </LinearGradient>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionHeader}>Description</Text>
            <Text style={styles.descriptionText}>
              {taskData?.find((task) => task.ID == task_id)?.task_description ||
                "No description"}
            </Text>
          </View>
        </>
      ) : (
        <>
          <Text
            style={[styles.assignedText, { fontSize: 15, fontWeight: "bold" }]}
          >
            Deadline:
          </Text>
          <View style={styles.row}>
            <View style={styles.deadlineBox}>
              <Ionicons name="calendar-outline" size={18} color="#555" />
              <Text style={styles.deadlineText}>{task_deadline}</Text>
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
              {taskData?.find((task) => task.ID == task_id)?.task_description ||
                "No description"}
            </Text>
          </View>
        </>
      )}

      {/* Bottom Work Area */}
      {taskData && taskData.some((task) => task.employeeID == userInfo.ID ) && (
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
          {uploadedFiles.length > 0 && (
            <TouchableOpacity style={styles.submitBtn} onPress={submitWork}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
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
              <Text style={styles.modalTitle}>Your work</Text>

              <TouchableOpacity style={styles.addFileBtn} onPress={pickFile}>
                <Ionicons name="cloud-upload-outline" size={24} color="black" />
                <Text> Upload File</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={uploadedFiles}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.fileItem}>
                  <Ionicons name="document-outline" size={20} color="#333" />
                  <Text style={{ marginLeft: 8, flex: 1 }}>{item.name}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setUploadedFiles((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <Ionicons name="trash-outline" size={22} color="red" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ color: "#666", textAlign: "center" }}>
                  No files uploaded
                </Text>
              }
            />
            <TouchableOpacity
              style={styles.done_btn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{color:"white",fontWeight:"bold"}}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    bottom: 35,
    width: "110%",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
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
  done_btn:{
    backgroundColor:"#03b7ffff",
    padding:10,
    borderRadius:100,
    justifyContent: 'center',
    alignItems:"center"
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
