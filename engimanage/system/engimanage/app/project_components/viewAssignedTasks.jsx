import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import globalScript from "../globals/globalScript";

const link = globalScript;

const randomColors = ["#ff7675", "#74b9ff", "#55efc4", "#ffeaa7", "#a29bfe"];

const ViewAssignedTasks = () => {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;

    const fetchTasks = async () => {
      try {
        const response = await fetch(`${link.api_link}/getAssignedTasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const json = await response.json();

        if (!json.ok) {
          setLoading(false);
          return;
        }

        const data = json.data;

        // Group tasks per user (assignedto)
        const grouped = data.reduce((acc, item) => {
          if (!acc[item.assignedto]) {
            acc[item.assignedto] = {
              ...item,
              tasks: [item.task_name],
              color:
                randomColors[Math.floor(Math.random() * randomColors.length)],
            };
          } else {
            acc[item.assignedto].tasks.push(item.task_name);
          }
          return acc;
        }, {});

        setGroupedData(Object.values(grouped));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setLoading(false);
      }
    };

    fetchTasks();

    interval = setInterval(fetchTasks, 500);

    return () => clearInterval(interval);
  }, []);

  const renderCard = ({ item }) => (
    <View style={[styles.card, { borderLeftColor: item.color }]}>
      <View style={styles.headerRow}>
        {/* <TouchableOpacity style={styles.checkbox} /> */}
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.deadline}>Assigned Tasks:</Text>
        </View>
      </View>

      <View style={styles.taskContainer}>
        {item.tasks.map((task, index) => (
          <View key={index} style={styles.taskBubble}>
            <Text style={styles.taskText}>{task}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <FlatList
      data={groupedData}
      keyExtractor={(item) => item.assignedto.toString()}
      renderItem={renderCard}
      contentContainerStyle={styles.container}
    />
  );
};

export default ViewAssignedTasks;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    borderLeftWidth: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#999",
    marginRight: 10,
    borderRadius: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  deadline: {
    fontSize: 13,
    color: "#666",
  },
  taskContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  taskBubble: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  taskText: {
    fontSize: 13,
    color: "#333",
  },
});
