import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Pressable,
  Dimensions,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import DataSecureStorage from "../components/DataSecureStorage";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Container, { Toast } from "toastify-react-native";
import { router } from "expo-router";
import CustomHeader from "../components/customHeader";

import globalScript from "../globals/globalScript";
const link = globalScript;

const SCREEN = Dimensions.get("window");
const MENU_WIDTH = 170;

//  Custom checkbox component (no extra package needed)
const CustomCheckbox = ({ checked, onChange, show_checkBox }) => (
  <TouchableOpacity
    onPress={() => onChange(!checked)}
    style={styles.checkboxContainer}
    disabled={true}
  >
    {show_checkBox && (
      <Ionicons
        name={checked ? "checkbox" : "square-outline"}
        size={24}
        color={checked ? "#4CAF50" : "#c2c2c2"}
      />
    )}
  </TouchableOpacity>
);

const Task = ({ projectID }) => {
  const [userInfo, setUserinfo] = useState(null);
  const [TASKS, setTask] = useState(null);
  const [taskProgress, setTaskProgress] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const [deadline, setDeadline] = useState(new Date());
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTaskId, setMenuTaskId] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const menuButtonRefs = useRef({});

  useEffect(() => {
    getUserInfo();
    handleGetTasks();
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {

      handleGetTasks();
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const fetchProjectMembers = async () => {
    try {
      const response = await fetch(`${link.api_link}/getProjectMembers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectID }),
      });
      const data = await response.json();
      if (data.ok) setProjectMembers(data.result);
    } catch (error) {
      console.error(error);
    }
  };

  const openAssignModal = async ({
    userId,
    projectId,
    taskId,
    taskName,
    taskDeadline,
  }) => {
    setMenuTaskId(taskId);
    setSelectedMember(null);
    fetchProjectMembers();
    setAssignModalVisible(true);
  };

  const getUserInfo = async () => {
    const data = await DataSecureStorage.getItem("loginData");
    if (data) {
      const info = JSON.parse(data);
      setUserinfo(info);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedMember) {
      Toast.error("Please select a member!");
      return;
    }

    if (!menuTaskId) {
      Toast.error("No task selected!");
      return;
    }

    const task = TASKS.find((t) => t.ID === menuTaskId);
    if (!task) {
      Toast.error("Task not found!");
      return;
    }

    try {
      const reqBody = {
        userId: selectedMember,
        projectId: task.projectID,
        taskId: task.ID,
        taskName: task.label,
        taskDeadline: task.task_deadline,
      };

      const response = await fetch(`${link.api_link}/takeTask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const data = await response.json();

      if (data.ok) {
        Toast.success("Task assigned successfully");
        handleGetTasks();
        setAssignModalVisible(false);
      } else {
        Toast.error(data.message || "Failed to assign task");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetTasks = async () => {
    try {
      const reqBody = { projectID };
      const response = await fetch(`${link.api_link}/getTasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();

      if (data.ok && data.result.length > 0) {
        setTask(data.result);

        const initial = data.result.reduce((acc, task) => {
          acc[task.ID] = task.progress || 0;
          return acc;
        }, {});
        setTaskProgress(initial);
      } else {
        setTask(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateTasks = async (id, progress) => {
    try {
      const reqBody = { id, progress };
      await fetch(`${link.api_link}/updateTask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckboxToggle = (id, checked) => {
    const value = checked ? 100 : 0;
    setTaskProgress((prev) => ({ ...prev, [id]: value }));
    updateTasks(id, value);
  };

  const confirm = (title, message) => {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
          { text: "Yes", onPress: () => resolve(true) },
        ],
        { cancelable: false }
      );
    });
  };

  const handleDeteleTask = async (ID) => {
    console.log(`Deleting task with ID: ${ID}`);

    let conf = await confirm(
      "Delete Task",
      "Are you sure you want to delete this task?"
    );
    if (!conf) return;

    try {
      const reqBody = { ID };
      const response = await fetch(`${link.api_link}/deleteTask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();
      if (data.ok) {
        // Toast.success("Task deleted successfully");
        handleGetTasks();
      } else {
        Toast.error(data.message || "Failed to delete task");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handle_takeTask = async (
    userId,
    projectId,
    taskId,
    taskName,
    taskDeadline
  ) => {
    try {
      const reqBody = { userId, projectId, taskId, taskName, taskDeadline };
      const response = await fetch(`${link.api_link}/takeTask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();
      if (data.ok) {
        Toast.success("Task taken successfully");
        handleGetTasks();
      } else {
        Toast.error(data.message || "Failed to take task");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskLabel) {
      alert("Missing task label");
      return;
    }

    try {
      const reqBody = {
        projectID,
        label: newTaskLabel,
        description: newTaskDescription,
        deadline: deadline ? deadline.toISOString().split("T")[0] : null, // YYYY-MM-DD
      };

      const response = await fetch(`${link.api_link}/createTask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();
      if (data.ok) {
        Toast.success("Task created successfully");
        handleGetTasks();
        setDeadline(null);
        setNewTaskDescription("");
      } else {
        Toast.error(data.message || "Failed to create task");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ---- Menu helpers (Modal-based) ----
  const openMenu = (taskId) => {
    const ref = menuButtonRefs.current[taskId];
    if (!ref) return;

    // Ensure measurement works on Android
    ref.measureInWindow((x, y, width, height) => {
      setMenuTaskId(taskId);
      setAnchorRect({ x, y, width, height });
      setMenuVisible(true);
    });
  };

  const closeMenu = () => {
    setMenuVisible(false);
    // setMenuTaskId(null);
    setAnchorRect(null);
  };

  const totalProgress =
    Object.values(taskProgress).reduce((sum, val) => sum + val, 0) /
    (TASKS?.length * 100 || 1);

  // Calculate final menu position within screen bounds
  const getMenuStyle = () => {
    if (!anchorRect) return {};
    const top = Math.min(
      anchorRect.y + anchorRect.height + 6,
      SCREEN.height - 8 - 120
    );
    const left = Math.min(
      Math.max(8, anchorRect.x + anchorRect.width - MENU_WIDTH),
      SCREEN.width - MENU_WIDTH - 8
    );
    return { top, left, width: MENU_WIDTH };
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Tasks" routePath={"tabsHandler"} backName="Home" />
      <Container
        position="top"
        duration={1500}
        style={{ width: "250" }}
        showCloseIcon={true}
      />
      {TASKS === null ? (
        <View style={styles.container}>
          {/* <Text style={styles.title}>Tasks</Text> */}
          {loadingTimeout ? (
            <>
              {(userInfo?.permission_key === "full" || userInfo?.permission_key === "add_edit_update_delete") && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowModal(true)}
                >
                  <Text style={styles.addButtonText}>+ Add Task</Text>
                </TouchableOpacity>
              )}
              <Text style={{ color: "red" }}>No Current Task</Text>
            </>
          ) : (
            <>
              <Text style={styles.loadingText}>Loading tasks...</Text>
              <ActivityIndicator size="large" color="#4CAF50" />
            </>
          )}
        </View>
      ) : (
        <>
          {/* <Text style={styles.title}>Tasks</Text> */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {Math.round(totalProgress * 100)}% Complete
            </Text>
            <ProgressBar
              progress={totalProgress}
              color="#4CAF50"
              style={styles.progressBar}
            />
          </View>

          {(userInfo?.permission_key === "full" || userInfo?.permission_key === "add_edit_update_delete") && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Task</Text>
            </TouchableOpacity>
          )}

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => menuVisible && closeMenu()}
          >
            {TASKS.map((task) => {
              const isChecked = taskProgress[task.ID] === 100;
              return (
                <View style={styles.item} key={task.ID}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() =>
                      router.navigate({
                        pathname: "project_components/taskView",
                        params: {
                          label: task.label,
                          task_deadline: task.task_deadline,
                          task_id: task.ID,
                        },
                      })
                    }
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <CustomCheckbox
                        checked={isChecked}
                        show_checkBox={isChecked}
                        onChange={(checked) =>
                          handleCheckboxToggle(task.ID, checked)
                        }
                      />

                      <View style={{ flexDirection: "column", flex: 1 }}>
                        <Text
                          style={[styles.label, isChecked && styles.checked]}
                        >
                          {task.label}
                        </Text>

                        {task.task_deadline && (
                          <View style={styles.deadlineRow}>
                            <Ionicons
                              name="calendar-outline"
                              size={16}
                              color="#555"
                              style={{ marginRight: 6 }}
                            />
                            <Text style={styles.deadlineText}>
                              {task.task_deadline}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.assignStatusText,
                          (() => {
                            let color = "gray"; // default
                            switch (task.assign_status) {
                              case "assigned":
                                color = "blue";
                                break;
                              case "available":
                                color = "green";
                                break;
                              case "pending":
                                color = "orange";
                                break;
                            }
                            return {
                              color: color,
                              borderColor: color,
                            };
                          })(),
                        ]}
                      >
                        {task.assign_status}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {(userInfo?.permission_key === "add_edit_update_delete" || userInfo?.permission_key === "full" || userInfo?.permission_key === "edit_update") && (
                    <TouchableOpacity
                      ref={(el) => (menuButtonRefs.current[task.ID] = el)}
                      collapsable={false}
                      onPress={() => openMenu(task.ID)}
                      style={styles.menuAnchorBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={22}
                        color="#333"
                      />
                    </TouchableOpacity>
                  )}

                  {/* Action Menu */}
                  <Modal
                    visible={menuVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={closeMenu}
                  >
                    {/* Backdrop */}
                    <Pressable style={styles.backdrop} onPress={closeMenu} />

                    {/* Menu card anchored to icon */}
                    <View
                      pointerEvents="box-none"
                      style={StyleSheet.absoluteFill}
                    >
                      <View style={[styles.menuCard, getMenuStyle()]}>
                        {(userInfo?.permission_key === "add_edit_update_delete" || userInfo?.permission_key === "full") && (
                        <Pressable
                          style={styles.menuItem}
                          onPress={() => {
                            const currentTask = TASKS.find(
                              (t) => t.ID === menuTaskId
                            );
                            openAssignModal({
                              userId: userInfo.ID,
                              projectId: currentTask.projectID,
                              taskId: currentTask.ID,
                              taskName: currentTask.label,
                              taskDeadline: currentTask.task_deadline,
                            });
                            console.log("Assign pressed", {
                              userId: userInfo.ID,
                              projectId: currentTask.projectID,
                              taskId: currentTask.ID,
                              taskName: currentTask.label,
                              taskDeadline: currentTask.task_deadline,
                            });

                            closeMenu();
                          }}
                        >
                          <Ionicons name="person-add-outline" size={18} />
                          <Text style={styles.menuText}>Assign To</Text>
                        </Pressable>
                        )}

                        <Pressable
                          style={styles.menuItem}
                          onPress={() => {
                            const currentTask = TASKS.find(
                              (t) => t.ID === menuTaskId
                            );
                            if (!currentTask) return;

                            handle_takeTask(
                              userInfo.ID,
                              currentTask.projectID,
                              currentTask.ID,
                              currentTask.label,
                              currentTask.task_deadline
                            );

                            console.log("Take pressed", {
                              userId: userInfo.ID,
                              projectId: currentTask.projectID,
                              taskId: currentTask.ID,
                              taskName: currentTask.label,
                              taskDeadline: currentTask.task_deadline,
                            });

                            closeMenu();
                          }}
                        >
                          <Ionicons name="download-outline" size={18} />
                          <Text style={styles.menuText}>Take</Text>
                        </Pressable>

                        <View style={styles.menuDivider} />
                        
                        {(userInfo?.permission_key === "add_edit_update_delete" || userInfo?.permission_key === "full") && (

                        <Pressable
                          style={styles.menuItem}
                          onPress={() => {
                            const id = menuTaskId;
                            closeMenu();
                            if (id != null) handleDeteleTask(id);
                          }}
                        >
                          <Ionicons name="trash-outline" size={18} />
                          <Text style={[styles.menuText, { color: "#e53935" }]}>
                            Delete
                          </Text>
                        </Pressable>
                        )}

                      </View>
                    </View>
                  </Modal>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* Assign Modal UI */}
      <Modal
        visible={assignModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { width: "85%" }]}>
            <Text style={styles.modalTitle}>Assign Task</Text>
            <ScrollView style={{ maxHeight: 300, width: "100%" }}>
              {projectMembers.map((member) => (
                <TouchableOpacity
                  key={member.ID}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                  onPress={() => setSelectedMember(member.ID)}
                >
                  <Ionicons
                    name={
                      selectedMember === member.ID
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={24}
                    color="#4CAF50"
                  />
                  <Text style={{ marginLeft: 12, fontSize: 16 }}>
                    {member.fname.replace(/_/g, " ")}{" "}
                    {member.lname.replace(/_/g, " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleAssignTask}
            >
              <Text style={styles.confirmButtonText}>Assign</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAssignModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create a New Task</Text>
            <TextInput
              placeholder="Enter task label"
              style={styles.input}
              value={newTaskLabel}
              onChangeText={setNewTaskLabel}
            />
            <TextInput
              placeholder="Enter task description"
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              multiline={true}
              numberOfLines={3}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Deadline</Text>

              <Pressable
                style={[
                  styles.deadlineInput,
                  { flexDirection: "row", alignItems: "center" },
                ]}
                onPress={() => setShowDeadlinePicker(true)}
              >
                <Ionicons name="calendar" size={18} color="#494949ff" />
                <Text>Deadline: </Text>
                <Text style={{ color: deadline ? "#000" : "#aaa" }}>
                  {deadline
                    ? deadline.toISOString().split("T")[0]
                    : "Select deadline"}
                </Text>
              </Pressable>

              {showDeadlinePicker && (
                <DateTimePicker
                  value={deadline || new Date()}
                  mode="date"
                  display="calendar"
                  onChange={(event, selectedDate) => {
                    setShowDeadlinePicker(false);
                    if (selectedDate) {
                      const onlyDate = new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate() + 1
                      );
                      setDeadline(onlyDate);
                    }
                  }}
                />
              )}
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                handleCreateTask();
                setNewTaskLabel("");
                setShowModal(false);
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setNewTaskLabel("");
                setShowModal(false);
              }}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Task;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
  },
  scrollArea: {
    flex: 1,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  label: {
    fontSize: 18,
  },
  checked: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  checkboxContainer: {
    marginRight: 10,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: "#4CAF50",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // --- Menu styles (Modal) ---
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  menuCard: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
  menuAnchorBtn: {
    paddingLeft: 6,
    paddingRight: 0,
    paddingVertical: 10,
  },
  fieldGroup: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  deadlineInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  deadlineText: {
    fontSize: 13,
    color: "#555",
  },
  assignStatusText: {
    fontSize: 12,
    borderWidth: 1,
    padding: 5,
    borderRadius: 50,
    width: 70,
    textAlign: "center",
    marginRight: 20,
  },
});
