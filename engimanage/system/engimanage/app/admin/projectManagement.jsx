import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";

import DataSecureStorage from "../components/DataSecureStorage";
import globalScript from "../globals/globalScript";
const link = globalScript;

// ----- Custom Component -----
const ProjectCard = ({ project }) => {
  // Handle members (parse string or fallback to 0)
  let memberCount = 0;
  if (project.members) {
    try {
      const parsed = JSON.parse(project.members);
      memberCount = Array.isArray(parsed) ? parsed.length : 0;
    } catch (e) {
      memberCount = 0;
    }
  }

  const [userInfo, setUserInfo] = useState(null);

  useEffect(()=>{
    getUserInfo();
  },[])

  const getUserInfo = async () => {
    const data = await DataSecureStorage.getItem("adminLoginData");
    
    if (data) {
      const info = JSON.parse(data);
      setUserInfo(info);
      console.log("=========");
      console.log(info);
      console.log("=========");
    }
  };

  // project membership verification before opening sang project ----------------->
  const handleProjectClick = async (projectID) => {
    // console.log(projectID);

    try {
      const reqBody = {
        userID:userInfo.ID,
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
          `/project_components/projectHandler?projectID=${projectID}&homeRoute=../../admin/adminHandler`
        );
      } else {
        setSelectedProjectID(projectID);
        setJoinpopup(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleProjectClick(project.ID)}
    >
      <Text style={styles.projectName}>{project.projectName}</Text>
      <Text style={styles.projectDesc}>{project.desc}</Text>
      <View style={styles.memberRow}>
        <Ionicons name="person-outline" size={16} color="#555" />
        <Text style={styles.memberCount}>{memberCount} members</Text>
      </View>
    </TouchableOpacity>
  );
};

// ----- Main Page -----
const projectManagement = () => {
  const [projects, setProjects] = useState([]); // ✅ fix null
  const [searchText, setSearchText] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);

  const [userInfo, setUserInfo] = useState(null);

  useEffect(()=>{
    getUserInfo();
  },[])

  const getUserInfo = async () => {
    const data = await DataSecureStorage.getItem("adminLoginData");
    
    if (data) {
      const info = JSON.parse(data);
      setUserInfo(info);
    }
  };

  // --- Debounce Search ---
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim() === "") {
        setFilteredProjects(projects);
      } else {
        const filtered = projects.filter((p) =>
          p.projectName.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredProjects(filtered);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchText, projects]); // ✅ include projects

  // Sync filtered list with fetched projects
  useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);

  useEffect(() => {
    getProjects();
  }, []);

  const getProjects = async () => {
    try {
      const response = await fetch(`${link.api_link}/getprojects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.ok) {
        setProjects(data.projects);
        // console.log("Projects:", data.projects);
      } else {
        console.log("No data response");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Project Management</Text>

      {/* Search Bar */}
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
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#777"
        />

        <TouchableOpacity onPress={() => setSearchText("")}>
          <Ionicons
            name="close"
            size={20}
            color="#555"
            style={{ marginHorizontal: 8 }}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.ID.toString()}
        contentContainerStyle={{ padding: 5 }}
        renderItem={({ item }) => <ProjectCard project={item} />}
      />
    </View>
  );
};

export default projectManagement;

// ----- Styles -----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 25,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dce9dc",
    borderRadius: 10,
    paddingHorizontal: 4,
    marginBottom: 16,
    paddingVertical: 5,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  projectDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberCount: {
    marginLeft: 5,
    fontSize: 14,
    color: "#333",
  },
});
