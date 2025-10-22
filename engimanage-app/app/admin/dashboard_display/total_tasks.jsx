import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import globalScript from "../../globals/globalScript";
import CustomHeader from "../../components/customHeader";

const link = globalScript;

const Total_tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${link.api_link}/getAllTasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.ok) {
        setTasks(data.result);
        setFilteredTasks(data.result);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  // Handle search filter
  const handleSearch = (text) => {
    setSearch(text);
    const filtered = tasks.filter((item) => {
      const query = text.toLowerCase();
      return (
        item.label.toLowerCase().includes(query) ||
        item.task_description.toLowerCase().includes(query)
      );
    });
    setFilteredTasks(filtered);
  };

  // Status color based on type
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return { backgroundColor: "#16a34a", color: "#fff" };
      case "overdue":
        return { backgroundColor: "#dc2626", color: "#fff" };
      case "ongoing":
        return { backgroundColor: "#ea580c", color: "#fff" };
      default:
        return { backgroundColor: "#374151", color: "#fff" };
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.navigate({
          pathname: "project_components/taskView",
          params: {
            label: item.label,
            task_deadline: item.task_deadline,
            task_id: item.ID,
          },
        })
      }
      style={styles.taskCard}
    >
      {/* Project Name */}
      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Project:</Text>
        <Text style={styles.infoValue}>
          {item.projectName || "Untitled Project"}
        </Text>
      </View>

      {/* Task Name */}
      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Task:</Text>
        <Text style={styles.infoValue}>{item.label}</Text>
      </View>

      {/* Description */}

      {/* Status + Progress */}
      <View style={styles.row}>
        <Text style={styles.taskDesc}>{item.task_description}</Text>
        <View
          style={[styles.statusBadge, getStatusStyle(item.completion_status)]}
        >
          <Text style={styles.statusText}>
            {item.completion_status.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title="All Tasks"
        bg_color={"#0f1115"}
        text_color={"white"}
      />

      <TextInput
        style={styles.searchInput}
        placeholder="Search tasks..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4ade80"
          style={{ marginTop: 20 }}
        />
      ) : filteredTasks.length === 0 ? (
        <Text style={styles.noData}>No tasks found.</Text>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.ID.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4ade80"
              colors={["#4ade80"]}
              progressBackgroundColor="#1a1d23"
            />
          }
        />
      )}
    </View>
  );
};

export default Total_tasks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: "#0f1115",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#f5f5f5",
  },
  searchInput: {
    backgroundColor: "#1c1f26",
    borderWidth: 1,
    borderColor: "#2c313a",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
    color: "#fff",
  },
  taskCard: {
    backgroundColor: "#1a1d23",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2a2f38",
  },
  taskLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  taskDesc: {
    fontSize: 14,
    color: "#94a3b8",
    marginVertical: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    fontWeight: "600",
    fontSize: 13,
  },
  progress: {
    fontSize: 14,
    color: "#15eefaff",
    fontWeight: "500",
  },
  noData: {
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 20,
    fontSize: 16,
  },
  infoBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  infoLabel: {
    color: "#9ca3af", // light gray
    fontSize: 13,
    fontWeight: "600",
    marginRight: 6,
  },

  infoValue: {
    color: "#f9fafb", // bright white
    fontSize: 15,
    fontWeight: "500",
  },

  taskDesc: {
    fontSize: 13,
    color: "#94a3b8",
    marginVertical: 8,
    lineHeight: 18,
  },
});
