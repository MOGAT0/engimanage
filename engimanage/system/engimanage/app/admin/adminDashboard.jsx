import { StyleSheet, Text, View, ScrollView, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { PieChart, BarChart } from "react-native-chart-kit";
import globalScript from "../globals/globalScript";

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

  useEffect(() => {
    if (loading) {
      fetch_projectInfoCounts();
      get_projectGraphInfo();
    }
  }, []);

  const taskData = [
    {
      name: "Completed Tasks",
      population: projectInfoCounts?.completed_tasks_count || 0,
      color: "#00ADB5",
      legendFontColor: "#EEEEEE",
      legendFontSize: 12,
    },
    {
      name: "Unassigned Tasks",
      population: projectInfoCounts?.unassigned_task_count || 0,
      color: "#FF5722",
      legendFontColor: "#EEEEEE",
      legendFontSize: 12,
    },
    {
      name: "In Progress Tasks",
      population: projectInfoCounts?.inprogress_task_count || 0,
      color: "#FFD369",
      legendFontColor: "#EEEEEE",
      legendFontSize: 12,
    },
  ];

  const fetch_projectInfoCounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${link.api_link}/projectstatus_count`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.ok) {
        setProjectInfoCounts(data.result[0]);
      } else {
        console.log("No Data");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const get_projectGraphInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${link.api_link}/getProjectGraphStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.ok) {
        console.log(data.result);
        setRawProjects(data.result);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.header}>Admin Dashboard</Text>

        {loading ? (
          <View>
            <Text>Loading...</Text>
          </View>
        ) : (
          <>
            {/* Overview Cards */}
            <View style={styles.cardRow}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Total Projects</Text>
                <Text style={styles.cardValue}>
                  {projectInfoCounts?.total_projects_count || "~"}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Completed Projects</Text>
                <Text style={styles.cardValue}>
                  {projectInfoCounts?.completed_projects_count || "~"}
                </Text>
              </View>
            </View>
            <View style={styles.cardRow}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Active Projects</Text>
                <Text style={styles.cardValue}>
                  {projectInfoCounts?.active_projects_count || "~"}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Total Tasks</Text>
                <Text style={styles.cardValue}>
                  {projectInfoCounts?.total_task || "~"}
                </Text>
              </View>
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

            {/* Bar Chart with Project IDs */}
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

            {/* Legend mapping project IDs -> full names */}
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

            {/* Recent Activity */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.listItem}>
              <Text style={styles.listText}>✔ Task completed by John</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listText}>
                ⚠ Project Beta deadline in 3 days
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listText}>+ New user added: Maria</Text>
            </View>
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
  style: {
    borderRadius: 16,
  },
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
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#222831",
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  listText: {
    color: "#EEEEEE",
    fontSize: 14,
  },

  /* Legend styles */
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
