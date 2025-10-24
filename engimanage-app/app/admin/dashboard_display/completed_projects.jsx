import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import DataSecureStorage from "../../components/DataSecureStorage";
import globalScript from "../../globals/globalScript";
import CustomHeader from "../../components/customHeader";

const link = globalScript;

const ProjectCard = ({ project, onPress }) => {
  let memberCount = 0;
  if (project.members) {
    try {
      const parsed = JSON.parse(project.members);
      memberCount = Array.isArray(parsed) ? parsed.length : 0;
    } catch (e) {
      memberCount = 0;
    }
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.projectName}>{project.projectName}</Text>
      <Text style={styles.projectDesc}>{project.desc}</Text>
      <Text style={{ color: "#c2c2c2", fontSize: 12, marginVertical: 10 }}>
        {project.projectManager.replace(/_/g, " ")}
      </Text>
      <View style={styles.memberRow}>
        <Ionicons name="person-outline" size={16} color="#555" />
        <Text style={styles.memberCount}>{memberCount} members</Text>
      </View>
    </TouchableOpacity>
  );
};

const completed_projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [projectManagers, setProjectManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isClickedLoading, setIsClickedLoading] = useState(false);

  useEffect(() => {
    getUserInfo();
    getProjects();
    getProjectManagers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getProjects();
    setRefreshing(false);
  };

  const getUserInfo = async () => {
    const data = await DataSecureStorage.getItem("adminLoginData");
    if (data) {
      setUserInfo(JSON.parse(data));
    }
  };

  // project membership verification before opening sang project ----------------->
  const handleProjectClick = async (projectID) => {
    // console.log(projectID);

    try {
      setIsClickedLoading(true)
      const reqBody = {
        userID: userInfo.ID,
        projectID,
      };
      const response = await fetch(`${link.api_link}/checkProjectMembers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();

      if (data.length >= 1 || userInfo.permission_key === "full") {
        router.navigate(
          `/project_components/projectHandler?projectID=${projectID}&homeRoute=../../admin/adminHandler&userType=admin`
        );
      } else {
        setSelectedProjectID(projectID);
        setJoinpopup(true);
      }
    } catch (error) {
      console.error(error);
    } finally{
        setIsClickedLoading(false)
    }
  };

  const getProjectManagers = async () => {
    try {
      const response = await fetch(`${link.api_link}/getProjectManagers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.ok) {
        setProjectManagers(data.result);
      }
    } catch (error) {
      console.log("Error fetching managers:", error);
    }
  };

  const getProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${link.api_link}/completed_projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.ok) {
        setProjects(data.result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim() || !selectedManager || !projectDesc.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    const req_data = {
      projectName,
      desc: projectDesc,
      projectManager: selectedManager.fname + " " + selectedManager.lname,
      userID: selectedManager.ID,
      deadline: deadline.toISOString().split("T")[0],
    };

    try {
      const res = await fetch(`${link.api_link}/createProject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req_data),
      });
      const data = await res.json();
      if (data.ok) {
        alert("Project created successfully!");
        setShowModal(false);
        getProjects();
      } else {
        alert("Failed to create project.");
      }
    } catch (err) {
      console.log("Create project error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title={"Completed Projects"}
        bg_color={"#393E46"}
        text_color={"white"}
      />
      {/* <Text style={styles.header}>Projects</Text> */}

      {/* <TouchableOpacity
        style={styles.createBTN}
        onPress={() => setShowModal(true)}
      >
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "bold" }}>
          Create Project
        </Text>
      </TouchableOpacity> */}

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color="#555"
          style={{ marginHorizontal: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#777"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {loading ? (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#00ADB5" />
          {/* <Text style={{ color: "#aaa", marginTop: 8 }}>
            Loading projects...
          </Text> */}
        </View>
      ) : (
        <FlatList
          data={filteredProjects.length ? filteredProjects : projects}
          keyExtractor={(item) => item.ID.toString()}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => handleProjectClick(item.ID)}
            />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00ADB5"
              colors={["#00ADB5"]}
              progressBackgroundColor="#222831"
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Text style={{ color: "#888" }}>No completed projects found</Text>
            </View>
          }
        />
      )}

      {/* CREATE PROJECT MODAL */}
      <Modal visible={showModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Create New Project</Text>

              <TextInput
                placeholder="Enter project name"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={projectName}
                onChangeText={setProjectName}
              />

              {/* Dropdown for project manager */}
              <Pressable
                onPress={() => setShowDropdown(!showDropdown)}
                style={styles.dropdown}
              >
                <Text style={{ color: "#eee" }}>
                  {selectedManager
                    ? `${selectedManager.fname} ${selectedManager.lname}`
                    : "Select Project Manager"}
                </Text>
                <Ionicons
                  name={showDropdown ? "chevron-up" : "chevron-down"}
                  color="#fff"
                  size={18}
                />
              </Pressable>

              {showDropdown && (
                <View style={styles.dropdownList}>
                  {projectManagers.map((m) => (
                    <TouchableOpacity
                      key={m.ID}
                      onPress={() => {
                        setSelectedManager(m);
                        setShowDropdown(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={{ color: "#fff" }}>
                        {m.fname} {m.lname}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TextInput
                placeholder="Enter project description"
                placeholderTextColor="#aaa"
                style={[
                  styles.input,
                  { height: 100, textAlignVertical: "top" },
                ]}
                value={projectDesc}
                onChangeText={setProjectDesc}
                multiline
              />

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.datePickerBtn}
              >
                <Text style={{ color: "#eee" }}>
                  Deadline: {deadline.toDateString()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={deadline}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDeadline(selectedDate);
                  }}
                  minimumDate={
                    new Date(new Date().setDate(new Date().getDate() + 1))
                  }
                />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#555" }]}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={{ color: "#fff" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#00ADB5" }]}
                  onPress={handleCreateProject}
                >
                  <Text style={{ color: "#fff" }}>Create</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {isClickedLoading && (
        <Modal transparent={true}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <ActivityIndicator size="large" color="#ebe005ff" />
            <Text style={{color:"white"}}>Opening Project...</Text>
          </View>
        </Modal>
      )}

    </View>
  );
};

export default completed_projects;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#393E46",
    padding: 16,
    paddingTop: 30,
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#EAEAEA",
    marginBottom: 20,
    marginTop: 25,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222831",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#222831",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2E2E2E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00E0FF",
    marginBottom: 6,
  },
  projectDesc: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 10,
    lineHeight: 18,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberCount: {
    marginLeft: 6,
    fontSize: 13,
    color: "#AAAAAA",
  },
  createBTN: {
    position: "absolute",
    top: 40,
    right: 15,
    backgroundColor: "#00ADB5",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "92%",
    backgroundColor: "#181818",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    color: "#00E0FF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
    textAlignVertical: "top",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  dropdownList: {
    backgroundColor: "#222831",
    borderRadius: 10,
    marginBottom: 10,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  datePickerBtn: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  modalBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 10,
  },
});
