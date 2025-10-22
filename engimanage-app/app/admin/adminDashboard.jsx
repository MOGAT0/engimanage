import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { PieChart, BarChart } from "react-native-chart-kit";
import globalScript from "../globals/globalScript";
import { router } from "expo-router";

const link = globalScript;
const screenWidth = Dimensions.get("window").width;

const getRandomColor = () =>
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

const adminDashboard = () => {
  const [projectInfoCounts, setProjectInfoCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rawProjects, setRawProjects] = useState([]);

  const projects = rawProjects.map((p) => ({
    ...p,
    color: getRandomColor(),
  }));

  const progressData = {
    labels: projects.map((p) => p.id),
    datasets: [
      {
        data: projects.map((p) => p.completed),
      },
    ],
  };

  const fetch_projectInfoCounts = async () => {
    try {
      const response = await fetch(`${link.api_link}/projectstatus_count`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.ok) setProjectInfoCounts(data.result[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const get_projectGraphInfo = async () => {
    try {
      const response = await fetch(`${link.api_link}/getProjectGraphStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.ok) setRawProjects(data.result);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetch_projectInfoCounts(), get_projectGraphInfo()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, []);

  const taskData = [
    {
      name: "Completed Tasks",
      population: projectInfoCounts?.completed_tasks_count || 0,
      color: "#00b22cff",
      legendFontColor: "#EEEEEE",
      legendFontSize: 12,
    },
    {
      name: "Unassigned Tasks",
      population: projectInfoCounts?.unassigned_task_count || 0,
      color: "#ff9c22ff",
      legendFontColor: "#EEEEEE",
      legendFontSize: 12,
    },
    {
      name: "In Progress Tasks",
      population: projectInfoCounts?.inprogress_task_count || 0,
      color: "#ebfe40ff",
      legendFontColor: "#EEEEEE",
      legendFontSize: 12,
    },
    {
      name: "Overdue Tasks",
      population: projectInfoCounts?.overdue_task_count || 0,
      color: "#cd0000ff",
      legendFontColor: "#EEEEEE",
      legendFontSize: 12,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
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
      >
        <Text style={styles.header}>Admin Dashboard</Text>

        {loading ? (
          <View>
            <Text style={{ color: "#EEEEEE", textAlign: "center" }}>
              Loading...
            </Text>
          </View>
        ) : (
          <>
            {/* Overview Cards */}
            <View style={styles.cardRow}>
              <TouchableOpacity
                onPress={() => router.navigate("admin/projectManagement")}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>Total Projects</Text>
                <Text style={styles.cardValue}>
                  {projectInfoCounts?.total_projects_count || "~"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.navigate("admin/dashboard_display/completed_projects")
                }
                style={styles.card}
              >
                <Text style={styles.cardTitle}>Completed Projects</Text>
                <Text style={styles.cardValue}>
                  {projectInfoCounts?.completed_projects_count || "~"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardRow}>
              <TouchableOpacity
                onPress={() =>
                  router.navigate("admin/dashboard_display/active_projects")
                }
                style={styles.card}
              >
                <Text style={styles.cardTitle}>Active Projects</Text>
                <Text style={styles.cardValue}>
                  {projectInfoCounts?.active_projects_count || "~"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.navigate("admin/dashboard_display/total_tasks")
                }
                style={styles.card}
              >
                <Text style={styles.cardTitle}>Total Tasks</Text>
                <Text style={styles.cardValue}>
                  {projectInfoCounts?.total_task || "~"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pie Chart */}
            <Text style={styles.sectionTitle}>Task Distribution</Text>
            <PieChart
              data={taskData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"16"}
              absolute
            />

            {/* Bar Chart */}
            <Text style={styles.sectionTitle}>
              Project Progress (Completed Tasks)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={progressData}
                width={Math.max(screenWidth - 32, projects.length * 80)}
                height={240}
                chartConfig={chartConfig}
                style={{ borderRadius: 12 }}
                fromZero
                showValuesOnTopOfBars
                verticalLabelRotation={45}
              />
            </ScrollView>

            {/* Legend */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.legendContainer}>
                {projects.map((p) => (
                  <View style={styles.legendItem} key={p.id}>
                    <View
                      style={[
                        styles.legendColorBox,
                        { backgroundColor: p.color },
                      ]}
                    />
                    <Text style={styles.legendText}>
                      {p.id} — {p.name}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default adminDashboard;

const chartConfig = {
  backgroundGradientFrom: "#393E46",
  backgroundGradientTo: "#393E46",
  color: (opacity = 1) => `rgba(238, 238, 238, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(238, 238, 238, ${opacity})`,
  style: { borderRadius: 16 },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#393E46",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EEEEEE",
    marginBottom: 16,
    marginTop: 20,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#222831",
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    color: "#EEEEEE",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00ADB5",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EEEEEE",
    marginTop: 20,
    marginBottom: 8,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  legendColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#fff",
  },
});
