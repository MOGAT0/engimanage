// import { StyleSheet, Text, View } from "react-native";
// import React, { useEffect, useState } from "react";
// import { useLocalSearchParams } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import globalScript from "../globals/globalScript";

// const link = globalScript;

// const TaskView = () => {
//   const [taskData, setTaskData] = useState(null);
//   const { label, task_deadline, task_id } = useLocalSearchParams();

//   const get_taskInfo = async () => {
//     try {
//       const response = await fetch(`${link.api_link}/getTaskInfo`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ task_id }),
//       });
//       const data = await response.json();

//       if (data.ok) {
//         setTaskData(data.data[0] || null);
//         console.log(data);
//       } else {
//         console.log("Error fetching task info:", data.message);
//       }
//     } catch (error) {
//       console.log("Error fetching task info:", error);
//     }
//   };

//   useEffect(() => {
//     get_taskInfo();
//   }, []);

//   return (
//     <View style={styles.container}>
//       {/* Task Title */}
//       <Text style={styles.taskLabel}>{label}</Text>
//       {taskData ? (
//         <>
//           <Text style={[styles.assignedText,{fontSize:15,fontWeight:"bold"}]}>Deadline:</Text>
//           {/* Assigned To + Deadline Row */}
//           <View style={styles.row}>
//             {/* <Text style={styles.assignedText}>
//               Assigned to: {taskData.employee_name}
//             </Text> */}
            
//             <View style={styles.deadlineBox}>
//               <Ionicons name="calendar-outline" size={18} color="#555" />
//               <Text style={styles.deadlineText}>{task_deadline}</Text>
//             </View>
//           </View>

//           {/* Status Card */}
//           <LinearGradient
//             colors={
//               taskData.progress === 100
//                 ? ["#4caf50", "#2e7d32"] // green gradient for completed
//                 : ["#ff9800", "#f57c00"] // orange gradient for in-progress
//             }
//             style={styles.statusCard}
//           >
//             <Text style={styles.statusText}>
//               {taskData.progress === 100 ? "Completed" : "In Progress"}
//             </Text>
//           </LinearGradient>

//           {/* Description */}
//           <View style={styles.descriptionBox}>
//             <Text style={styles.descriptionHeader}>Description</Text>
//             <Text style={styles.descriptionText}>
//               {taskData.task_description}
//             </Text>
//           </View>
//         </>
//       ) : (
//         <Text style={styles.notAssigned}>Not assigned</Text>
//       )}
//     </View>
//   );
// };

// export default TaskView;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   taskLabel: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 20,
//     color: "#333",
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   assignedText: {
//     fontSize: 16,
//     color: "#444",
//   },
//   deadlineBox: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   deadlineText: {
//     fontSize: 14,
//     marginLeft: 5,
//     color: "#555",
//   },
//   statusCard: {
//     borderRadius: 12,
//     paddingVertical: 15,
//     marginBottom: 20,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   statusText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   descriptionBox: {
//     marginTop: 10,
//   },
//   descriptionHeader: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 5,
//     color: "#333",
//   },
//   descriptionText: {
//     fontSize: 15,
//     lineHeight: 22,
//     color: "#444",
//     textAlign: "justify",
//   },
//   notAssigned: {
//     color: "red",
//     fontWeight: "bold",
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 20,
//   },
// });


import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import globalScript from "../globals/globalScript";

const link = globalScript;

const TaskView = () => {
  const [taskData, setTaskData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const { label, task_deadline, task_id } = useLocalSearchParams();

  const get_taskInfo = async () => {
    try {
      const response = await fetch(`${link.api_link}/getTaskInfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id }),
      });
      const data = await response.json();

      if (data.ok) {
        setTaskData(data.data[0] || null);
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

  // Pick document (pdf, pptx, etc.)
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (result.type === "success") {
      setUploadedFiles((prev) => [...prev, result]);
    }
  };

  // Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setUploadedFiles((prev) => [
        ...prev,
        { name: "image.jpg", uri: result.assets[0].uri, type: "image" },
      ]);
    }
  };

  const submitWork = () => {
    console.log("Submitting files:", uploadedFiles);
    // TODO: upload to server
    alert("Work submitted!");
  };

  return (
    <View style={styles.container}>
      {/* Task Title */}
      <Text style={styles.taskLabel}>{label}</Text>

      {taskData ? (
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

          <LinearGradient
            colors={
              taskData.progress === 100
                ? ["#4caf50", "#2e7d32"]
                : ["#ff9800", "#f57c00"]
            }
            style={styles.statusCard}
          >
            <Text style={styles.statusText}>
              {taskData.progress === 100 ? "Completed" : "In Progress"}
            </Text>
          </LinearGradient>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionHeader}>Description</Text>
            <Text style={styles.descriptionText}>
              {taskData.task_description}
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.notAssigned}>Not assigned</Text>
      )}

      {/* Bottom Work Area */}
      <View style={styles.bottomBar}>
        {uploadedFiles.length === 0 ? (
          <TouchableOpacity
            style={styles.addWorkBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addWorkText}>+ Add work</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitBtn} onPress={submitWork}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slide Up Modal */}
      <Modal
        animationType="slide"
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Your work</Text>

            <FlatList
              data={uploadedFiles}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.fileItem}>
                  <Ionicons name="document-outline" size={20} color="#333" />
                  <Text style={{ marginLeft: 8 }}>{item.name}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ color: "#666", textAlign: "center" }}>
                  No files uploaded
                </Text>
              }
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.optionBtn} onPress={pickDocument}>
                <Ionicons name="document-attach-outline" size={20} color="#444" />
                <Text style={{ marginLeft: 6 }}>Add File</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={20} color="#444" />
                <Text style={{ marginLeft: 6 }}>Add Image</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
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
  taskLabel: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#333" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  assignedText: { fontSize: 16, color: "#444" },
  deadlineBox: { flexDirection: "row", alignItems: "center" },
  deadlineText: { fontSize: 14, marginLeft: 5, color: "#555" },
  statusCard: { borderRadius: 12, paddingVertical: 15, marginBottom: 20, alignItems: "center", elevation: 4 },
  statusText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  descriptionBox: { marginTop: 10 },
  descriptionHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 5, color: "#333" },
  descriptionText: { fontSize: 15, lineHeight: 22, color: "#444", textAlign: "justify" },
  notAssigned: { color: "red", fontWeight: "bold", fontSize: 16, textAlign: "center", marginTop: 20 },

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
  },
  addWorkText: { color: "#00296b", fontWeight: "bold" },
  submitBtn: {
    backgroundColor: "#4caf50",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  fileItem: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 15 },
  optionBtn: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#eee", borderRadius: 8 },
  closeBtn: { marginTop: 15, alignItems: "center" },
  closeText: { color: "red", fontWeight: "bold" },
});
