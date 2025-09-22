import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import DataSecureStorage from "./components/DataSecureStorage";
import Ionicons from "react-native-vector-icons/Ionicons";
import globalScript from "../app/globals/globalScript";
import { router } from "expo-router";
const link = globalScript;

const Todo_task = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [employeeID, setEmployeeID] = useState(null);
  const [filter, setFilter] = useState("Assigned"); // "Assigned" | "Completed"

  const getUserInfo = async () => {
    const data = await DataSecureStorage.getItem("loginData");
    if (data) {
      const info = JSON.parse(data);
      setEmployeeID(info.ID);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, [employeeID]);

  const handle_getTodotask = async () => {
    try {
      const response = await fetch(`${link.api_link}/getTodoTask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeID }),
      });

      const data = await response.json();

      if (data.ok) {
        setTasks(data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;

    if (employeeID) {
      handle_getTodotask();
      interval = setInterval(() => {
        handle_getTodotask();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [employeeID]);

  // Apply filter based on progress
  const filteredTasks = tasks.filter((task) =>
    filter === "Assigned" ? task.progress === 0 : task.progress === 100
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        {loadingTimeout && <Text>Loading tasks...</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>To-do</Text>

      {/* Filter buttons */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "Assigned" && styles.activeBtn]}
          onPress={() => setFilter("Assigned")}
        >
          <Text
            style={[styles.filterText, filter === "Assigned" && styles.activeText]}
          >
            Assigned
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === "Completed" && styles.activeBtn]}
          onPress={() => setFilter("Completed")}
        >
          <Text
            style={[styles.filterText, filter === "Completed" && styles.activeText]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages when no tasks */}
      {filter === "Assigned" && filteredTasks.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="checkmark-done-circle-outline"
            size={80}
            color="orange"
          />
          <Text style={styles.caughtUpText}>You're all caught up for now.</Text>
        </View>
      ) : filter === "Completed" && filteredTasks.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="clipboard-outline"
            size={80}
            color="gray"
          />
          <Text style={styles.nothingHereText}>Nothing to see here</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.assigned_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.navigate({
                  pathname: "project_components/taskView",
                  params: {
                    label: item.task_name,
                    task_deadline: item.task_deadline,
                    task_id: item.task_id,
                  },
                })
              }
              style={styles.taskCard}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={[
                      styles.taskTitle,
                      { fontWeight: "bold", color: "#332277" },
                    ]}
                  >
                    {item.projectName} {" -> "}
                  </Text>
                  <Text style={styles.taskTitle}>
                    {item.task_name || "Unnamed Task"}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="calendar-outline" size={16} color="#888" />
                  <Text style={{ marginLeft: 5 }}>
                    {item.task_deadline || "No Deadline"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={25} color="#332277" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default Todo_task;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 35,
    backgroundColor: "#f9f9f9",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#332277",
  },
  taskTitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "left",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 15,
    paddingHorizontal: 8,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  activeBtn: {
    backgroundColor: "#332277",
  },
  filterText: {
    fontSize: 14,
    color: "#332277",
    fontWeight: "500",
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
  },
  caughtUpText: {
    fontSize: 16,
    color: "orange",
    marginTop: 10,
    fontWeight: "500",
  },
  nothingHereText: {
    fontSize: 16,
    color: "gray",
    marginTop: 10,
    fontWeight: "500",
  },
});
