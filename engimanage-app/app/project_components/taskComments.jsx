import {
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import CustomHeader from "../components/customHeader";
import DataSecureStorage from "../components/DataSecureStorage";

import globalScript from "../globals/globalScript";
const link = globalScript;

const TaskComments = () => {
  const { taskData } = useLocalSearchParams();

  const [modalVisible, setModalVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [task, setTask] = useState(null);
  const [commentData, setCommentData] = useState([]);
  const [userInfo, setUserInfo] = useState([]);

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

  const handleSend = async () => {
    if (comment.trim() === "") return;

    try {
      const response = await fetch(`${link.api_link}/addComment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectID: task.projectID,
          taskID: task.ID,
          userID: userInfo.ID,
          comment,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setComment("");
        setModalVisible(false);
        fetch_comments();
      } else {
        console.log("Failed to add comment:", data.message);
      }
    } catch (err) {
      console.error("Error sending comment:", err);
    }
  };

  // Parse task data once
  useEffect(() => {
    if (taskData) {
      try {
        setTask(JSON.parse(taskData));
      } catch (e) {
        console.error("Invalid taskData:", e);
      }
    }
  }, [taskData]);

  // Fetch comments when task is ready
  useEffect(() => {
    if (task) fetch_comments();
  }, [task]);

  const fetch_comments = async () => {
    try {
      const response = await fetch(`${link.api_link}/getComments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectID: task.projectID,
          taskID: task.ID,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setCommentData(data.result);
      } else {
        console.log("No Current Comment");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Debug logs
  useEffect(() => {
    // console.log("data:", commentData);
  }, [commentData]);

  return (
    <View style={styles.container}>
      <CustomHeader title={"Task Comments"} />

      {/* {task && (
        <View>
          <Text>Task Name: {task.label || ""}</Text>
          <Text>Description: {task.task_description || ""}</Text>
        </View>
      )} */}

      {/* Render comments */}
      <FlatList
        data={commentData}
        keyExtractor={(item) => item.commentID.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentBox}>
            <Text style={{ fontWeight: "bold",alignSelf: userInfo.ID === item.user_ID ? "flex-end" : "flex-start" }}>
              {item.employee_name.replace(/_/g, " ") || "Anonymous"}
            </Text>
            {/* {
                  backgroundColor:
                    userInfo.ID === item.user_ID ? "#ffb055ff" : "#0cbc7fff",
                }, */}
            <Text
              style={
                userInfo.ID === item.user_ID
                  ? styles.senderChatBubbles
                  : styles.chatBubbles
              }
            >
              {item.commentText}
            </Text>
            <Text style={{ fontSize: 10, alignSelf: userInfo.ID === item.user_ID ? "flex-end" : "flex-start" }}>{item.created_at}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No comments yet.</Text>}
      />

      {/* Button to open modal */}
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: "#fff" }}>Add Comment</Text>
      </TouchableOpacity>

      {/* Comment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Add a Comment</Text>

              {/* Input Row */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your comment..."
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />
                <TouchableOpacity onPress={handleSend}>
                  <Ionicons name="send" size={28} color="#007bff" />
                </TouchableOpacity>
              </View>

              {/* Cancel button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#fff" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default TaskComments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  commentBox: {
    flexDirection: "column",
    marginVertical: 4,
  },
  openButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 45,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  keyboardView: {
    width: "100%",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 15,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 10,
    maxHeight: 100,
  },
  closeButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  chatBubbles: {
    backgroundColor: "#0cbc7fff",
    color: "white",
    padding: 10,
    borderRadius: 20,
    borderTopLeftRadius: 0,
    fontSize: 16,
    marginVertical: 6,
    maxWidth: "75%",
    alignSelf: "flex-start",
    textAlign:"left"
  },

  senderChatBubbles: {
    backgroundColor: "#ffb055ff",
    color: "white",
    padding: 10,
    borderRadius: 20,
    borderBottomRightRadius: 0,
    fontSize: 16,
    marginVertical: 6,
    maxWidth: "75%",
    alignSelf: "flex-end",
    textAlign:"right"
  },
});
