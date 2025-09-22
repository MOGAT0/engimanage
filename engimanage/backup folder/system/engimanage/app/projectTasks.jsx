import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import Container, { Toast } from "toastify-react-native";
import { Alert } from "react-native";

import DataSecureStorage from './components/DataSecureStorage';
import link from "../app/globals/globalScript";

const getStatusStyle = (status) => {
  switch (status) {
    case "completed":
      return styles.statusCompleted;
    case "ongoing":
      return styles.statusOngoing;
    case "pending":
      return styles.statusPending;
    default:
      return {};
  }
};

const FILTERS = ["All", "Ongoing", "Completed", "Pending"];

const ProjectTasks = () => {
  const [filter, setFilter] = useState("All");
  const [projects, setProjects] = useState(null);

  
  useEffect(() => {
    getTaskManager();
  });

  const getTaskManager = async ()=>{
    
    const securedata = await DataSecureStorage.getItem('loginData');
    const userData = JSON.parse(securedata)
    
    if(!userData){
      console.log('No id');
      return;
    }

    try {
      const response = await fetch(`${link.api_link}/getTaskManager`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({userID:userData.ID})
      })

      const data = await response.json();

      if(data.ok){
        setProjects(data.result);
      }

    } catch (error) {
      console.error(error);
    }


  }

  const filteredProjects = (projects || []).filter((p) =>
    filter === "All" ? true : p.status === filter.toLowerCase()
  );


  const goToTaskTab = (projectID) => {
    router.push(`/project_components/projectHandler?initialTab=task&projectID=${projectID}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Container position={"top"}/>
      <Text style={styles.title}>Project Tasks Manager</Text>

      {projects === null || projects.length === 0? (
        <View style={styles.noTaskContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={80} color="orange" />
          <Text style={styles.noTaskTitle}>No Tasks Available</Text>
          <Text style={styles.noTaskSubtitle}>
            You're all caught up for now. Start a project to begin tracking tasks.
          </Text>
        </View>
      ):(
        <>
          {/* Filters */}
          <View style={styles.filterContainer}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterButton,
                  filter === f && styles.activeFilterButton,
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === f && styles.activeFilterText,
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cards */}
          {filteredProjects.map((project) => (
            <TouchableOpacity
              key={project.ID}
              style={styles.card}
              onPress={()=> goToTaskTab(project.ID)}
              activeOpacity={0.85}
            >
              <Text style={styles.cardTitle}>{project.projectName}</Text>

              {/* Status Badge */}
              <View style={[styles.statusBadge, getStatusStyle(project.status)]}>
                <Text style={styles.statusText}>{project.status}</Text>
              </View>

              {/* Bottom Info */}
              <View style={styles.cardFooter}>
                <View style={styles.footerLeft}>
                  <Ionicons name="calendar-outline" size={16} color="#555" />
                  <Text style={styles.footerText}>{project.deadline}</Text>
                </View>
                <View style={styles.footerRight}>
                  <Ionicons name="person-outline" size={16} color="#555" />
                  <Text style={styles.footerText}>{project.members_count}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

    </ScrollView>
  );
};

export default ProjectTasks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  activeFilterButton: {
    backgroundColor: "#332255",
  },
  filterText: {
    color: "#332255",
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderColor: "#332255",
    borderWidth: 1.5,
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  statusText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "capitalize",
  },
  statusOngoing: {
    backgroundColor: "#007bff",
  },
  statusCompleted: {
    backgroundColor: "#28a745",
  },
  statusPending: {
    backgroundColor: "#ff9900",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    color: "#333",
    fontSize: 14,
    marginLeft: 5,
  },
  noTaskContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    padding: 20,
  },
  noTaskTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  noTaskSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
});
