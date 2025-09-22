import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Progress from "react-native-progress";

const Overall_dashboard = () => {
  const [activeTab, setActiveTab] = useState("projects");

  // temp data for employee
  const employees = [
    { id: "1", name: "Alice", performance: "98%" },
    { id: "2", name: "Bob", performance: "92%" },
    { id: "3", name: "Charlie", performance: "88%" },
    { id: "4", name: "David", performance: "80%" },
    { id: "5", name: "Eve", performance: "76%" },
    { id: "6", name: "Jonathan", performance: "74%" },
    { id: "7", name: "James", performance: "69%" },
    { id: "8", name: "Bryan", performance: "63%" },
    { id: "9", name: "Peter", performance: "61%" },
    { id: "10", name: "Joe", performance: "58%" },
  ];
  const yourRank = { rank: 4, name: "YOU", performance: "80%" };

  const renderEmployeeRow = ({ item, index }) => {
    let bgColor = "#fff";
    let medal = null;
    if (index === 0) {
      bgColor = "#fff7d1";
      medal = "🥇";
    } else if (index === 1) {
      bgColor = "#e8f0ff";
      medal = "🥈";
    } else if (index === 2) {
      bgColor = "#ffe9d6";
      medal = "🥉";
    }
    return (
      <View style={[styles.rankRow, { backgroundColor: bgColor }]}>
        <Text style={styles.rankNum}>{index + 1}</Text>
        <Ionicons
          name="person-circle"
          size={32}
          color="#555"
          style={{ marginRight: 10 }}
        />
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.empName}>
            {item.name} {medal && <Text>{medal}</Text>}
          </Text>
        </View>
        <Text style={styles.empPerf}>⭐{item.performance}</Text>
      </View>
    );
  };

  // temp data for projects
  const projects = [
    {
      id: "1",
      name: "Engineering Dashboard",
      progress: 90,
      completed: 27,
      uncompleted: 3,
      tasks: [
        { name: "Backend Setup", progress: 100 },
        { name: "Frontend UI", progress: 100 },
        { name: "Testing", progress: 100 },
        { name: "Testing", progress: 100 },
        { name: "Testing", progress: 100 },
        { name: "Testing", progress: 100 },
        { name: "Testing", progress: 100 },
        { name: "Testing", progress: 100 },
        { name: "Testing", progress: 100 },
        { name: "Testing", progress: 100 },
      ],
    },
    {
      id: "2",
      name: "Livingstone HQ Renovation",
      progress: 72,
      completed: 18,
      uncompleted: 7,
      tasks: [
        { name: "Structural Works", progress: 100 },
        { name: "Interior Design", progress: 60 },
        { name: "Electrical Setup", progress: 40 },
        { name: "Electrical Setup", progress: 40 },
        { name: "Electrical Setup", progress: 40 },
        { name: "Electrical Setup", progress: 40 },
        { name: "Electrical Setup", progress: 40 },
        { name: "Electrical Setup", progress: 40 },
      ],
    },
    {
      id: "3",
      name: "Client Portal System",
      progress: 45,
      completed: 9,
      uncompleted: 11,
      tasks: [
        { name: "Auth Module", progress: 50 },
        { name: "API Gateway", progress: 30 },
        { name: "UI Development", progress: 20 },
        { name: "Docs", progress: 10 },
      ],
    },
  ];

  const ProjectCard = ({ project }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <View style={styles.projectCard}>
        <TouchableOpacity
          style={styles.projectHeader}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.projectName}>{project.name}</Text>
          <Ionicons
            name={expanded ? "caret-up" : "caret-down"}
            size={20}
            color="#333"
          />
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Progress.Bar
            progress={project.progress / 100}
            width={null}
            height={20}
            color="#88DEBC"
            unfilledColor="#e0e0e0"
            borderWidth={0}
            style={styles.progressBar}
          />
          <View style={styles.percentRow}>
            <Text style={[styles.percentText, { color: "#fff" }]}>
              {project.progress}%
            </Text>
            <Text style={[styles.percentText, { color: "#333" }]}>
              {100 - project.progress}%
            </Text>
          </View>
        </View>

        {/* Expanded */}
        {expanded && (
          <View style={styles.expandedInfo}>
            {/* Completed / Uncompleted status */}
            <View style={styles.statusRow}>
              <View style={[styles.statusBox, { backgroundColor: "#81E7AF" }]}>
                <Text style={styles.statusLabel}>Completed</Text>
                <Text style={styles.statusValue}>{project.completed}</Text>
              </View>
              <View style={[styles.statusBox, { backgroundColor: "#FF8282" }]}>
                <Text style={styles.statusLabel}>Uncompleted</Text>
                <Text style={styles.statusValue}>{project.uncompleted}</Text>
              </View>
            </View>

            {/* Scrollable task list */}
            <View style={{ maxHeight: 180 }}>
              <ScrollView
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {project.tasks.map((task, i) => {
                  const isCompleted = task.progress === 100;
                  return (
                    <View key={i} style={styles.taskItem}>
                      <Text style={styles.taskText}>{task.name}</Text>
                      <Text
                        style={[
                          styles.taskStatus,
                          { color: isCompleted ? "#A0D683" : "#FFBC4C" },
                        ]}
                      >
                        {isCompleted ? "Completed" : "Ongoing"}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Toggle Switch */}
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.switchBtn,
            activeTab === "projects" && styles.switchActive,
          ]}
          onPress={() => setActiveTab("projects")}
        >
          <Text
            style={
              activeTab === "projects"
                ? styles.switchTextActive
                : styles.switchText
            }
          >
            Projects
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.switchBtn,
            activeTab === "employees" && styles.switchActive,
          ]}
          onPress={() => setActiveTab("employees")}
        >
          <Text
            style={
              activeTab === "employees"
                ? styles.switchTextActive
                : styles.switchText
            }
          >
            Employees
          </Text>
        </TouchableOpacity>
      </View>

      {/* Employees */}
      {activeTab === "employees" && (
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>🏆 Top Performing Employees</Text>
          <View style={styles.podiumContainer}>
            <View style={styles.podiumBox}>
              <Text style={styles.rankLabel}>2nd</Text>
              <Ionicons name="person-circle" size={50} color="#C0C0C0" />
              <Ionicons
                name="trophy"
                size={20}
                color="#C0C0C0"
                style={{ marginTop: 5 }}
              />
              <Text style={styles.podiumText}>Bob</Text>
            </View>
            <View style={[styles.podiumBox, styles.podiumFirst]}>
              <Text style={styles.rankLabel}>1st</Text>
              <Ionicons name="person-circle" size={60} color="#FFD700" />
              <Ionicons
                name="trophy"
                size={24}
                color="#FFD700"
                style={{ marginTop: 5 }}
              />
              <Text style={styles.podiumText}>Alice</Text>
            </View>
            <View style={styles.podiumBox}>
              <Text style={styles.rankLabel}>3rd</Text>
              <Ionicons name="person-circle" size={50} color="#CD7F32" />
              <Ionicons
                name="trophy"
                size={20}
                color="#CD7F32"
                style={{ marginTop: 5 }}
              />
              <Text style={styles.podiumText}>Charlie</Text>
            </View>
          </View>
          <FlatList
            data={employees}
            keyExtractor={(item) => item.id}
            renderItem={renderEmployeeRow}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 15 }}
          />
          <View style={styles.yourRankBox}>
            <Text style={{ fontWeight: "bold", fontSize: 16, color: "white" }}>
              Rank {yourRank.rank} - {yourRank.name}
            </Text>
            <Text style={{ color: "white" }}>
              Performance: ⭐{yourRank.performance}
            </Text>
          </View>
        </View>
      )}

      {/* Projects */}
      {activeTab === "projects" && (
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>📈 Top Performing Projects</Text>
          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProjectCard project={item} />}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      )}
    </View>
  );
};

export default Overall_dashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7", paddingTop: 40 },
  switchContainer: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  switchActive: { backgroundColor: "#647FBC" },
  switchText: { color: "#333", fontWeight: "600" },
  switchTextActive: { color: "#fff", fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#222",
  },

  // Employees
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    marginVertical: 5,
  },
  podiumBox: { alignItems: "center", justifyContent: "center" },
  podiumFirst: { marginBottom: 20 },
  podiumText: { marginTop: 3, fontWeight: "bold", fontSize: 14 },
  rankLabel: { fontSize: 14, fontWeight: "bold", marginBottom: 3 },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 30,
    borderRadius: 100,
    elevation: 2,
  },
  rankNum: { fontWeight: "bold", fontSize: 16, marginRight: 10 },
  empName: { fontSize: 14, fontWeight: "bold" },
  empPerf: { fontSize: 12, color: "#555" },
  yourRankBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#3118ea96",
    padding: 15,
    borderRadius: 100,
    alignItems: "center",
    borderWidth: 1,
  },

  // Projects
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  progressContainer: { marginTop: 12, position: "relative" },
  progressBar: { borderRadius: 8 },
  percentRow: {
    position: "absolute",
    top: 2,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  percentText: { fontSize: 12, fontWeight: "bold" },

  expandedInfo: {
    marginTop: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  statusBox: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  statusLabel: { fontSize: 12, color: "#fff", marginBottom: 4 },
  statusValue: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  taskItem: {
    marginBottom: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  taskText: { fontSize: 14, fontWeight: "500", color: "#333" },
  taskStatus: { fontSize: 13, fontWeight: "600" },
});
