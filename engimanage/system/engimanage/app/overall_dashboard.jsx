import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Progress from "react-native-progress";

import DataSecureStorage from "../app/components/DataSecureStorage";
import globalScript from "./globals/globalScript";

const link = globalScript;

const Overall_dashboard = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const [refreshingEmployees, setRefreshingEmployees] = useState(false);
  const [refreshingProjects, setRefreshingProjects] = useState(false);

  // temp data for employee
  const [employees, setemployee] = useState([]);
  const [yourRank, setYourRank] = useState({});
  const [yourPosition, setYourPosition] = useState("~");
  const [userinfo, setUserinfo] = useState(null);

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
        <Text style={styles.empPerf}>
          ⭐{item.performance ? item.performance : 0}%
        </Text>
      </View>
    );
  };
  const [projects, setProjects] = useState([]);

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

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(()=>{
    if(projects.length === 0){
      get_taks_info();
    }

  },[projects])

  useEffect(() => {
    if (userinfo && employees.length === 0) {
      fetch_ranking_info();
    }
  }, [userinfo, employees]);

  const getUserInfo = async () => {
    const data = await DataSecureStorage.getItem("loginData");
    if (data) {
      const info = JSON.parse(data);
      setUserinfo(info);
    }
  };

  const fetch_ranking_info = async () => {
    setRefreshingEmployees(true);
    try {
      const response = await fetch(`${link.api_link}/get_employee_ranking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.ok) {
        setemployee(data.result);
        setYourRank(data.result.find((a) => a.employee_id === userinfo.ID));
        setYourPosition(
          Number(data.result.findIndex((a) => a.employee_id === userinfo.ID)) +
            1
        );
      } else {
        console.log("no data");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshingEmployees(false);
    }
  };

  const get_taks_info = async () => {
    setRefreshingProjects(true);
    try {
      const response = await fetch(`${link.api_link}/get_projectRanking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.ok) {
        console.log(JSON.stringify(data.result));
        setProjects(data.result);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally{
      setRefreshingProjects(false);
    }
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
      {(activeTab === "employees" && employees.length > 0) && (
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
              <Text style={styles.podiumText}>{employees[1]?.name}</Text>
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
              <Text style={styles.podiumText}>{employees[0]?.name}</Text>
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
              <Text style={styles.podiumText}>{employees[2]?.name}</Text>
            </View>
          </View>
          {employees && (
            <FlatList
              data={employees}
              keyExtractor={(item) => item.id}
              renderItem={renderEmployeeRow}
              contentContainerStyle={{ paddingBottom: 100, paddingTop: 15 }}
              refreshing={refreshingEmployees}
              onRefresh={fetch_ranking_info}
            />
          )}

          <View style={styles.yourRankBox}>
            {yourRank ? (
              <>
                <Text
                  style={{ fontWeight: "bold", fontSize: 16, color: "white" }}
                >
                  Rank: {yourPosition} - YOU
                </Text>
                <Text style={{ color: "white" }}>
                  Performance: ⭐{yourRank?.performance}%
                </Text>
              </>
            ) : (
              <View style={styles.unranked}>
                <Text
                  style={{
                    color: "#cb2121ff",
                    fontWeight: "bold",
                    fontSize: 18,
                  }}
                >
                  Not in Rank
                </Text>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 13 }}
                >
                  "Keep Grinding"
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Projects */}
      {activeTab === "projects" && (
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Top Performing Projects</Text>
          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProjectCard project={item} />}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshing={refreshingProjects}
            onRefresh={get_taks_info}
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
  unranked: {
    justifyContent: "center",
    alignItems: "center",
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
