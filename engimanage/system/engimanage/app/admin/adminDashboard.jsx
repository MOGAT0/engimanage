import { StyleSheet, Text, View, ScrollView, Dimensions } from "react-native";
import React from "react";
import { PieChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const adminDashboard = () => {
  // Mock data for charts
  const taskData = [
    {
      name: "Completed",
      population: 42,
      color: "#00ADB5",
      legendFontColor: "#EEEEEE",
      legendFontSize: 12,
    },
    {
      name: "Overdue",
      population: 3,
      color: "#FF5722",
      legendFontColor: "#EEEEEE",
      legendFontSize: 12,
    },
    {
      name: "In Progress",
      population: 15,
      color: "#FFD369",
      legendFontColor: "#EEEEEE",
      legendFontSize: 12,
    },
  ];

  // Projects list (id, full name, completed tasks, color for legend)
  const projects = [
    { id: "P1", name: "House & Lot", completed: 12, color: "#4ECCA3" },
    { id: "P2", name: "Apartment Complex", completed: 8, color: "#00ADB5" },
    { id: "P3", name: "Office Building", completed: 15, color: "#FFD369" },
    { id: "P4", name: "Warehouse", completed: 5, color: "#FF5722" },
  ];

  // Bar chart data uses the short IDs as labels and completed counts as values
  const progressData = {
    labels: projects.map((p) => p.id), // ["P1", "P2", ...]
    datasets: [
      {
        data: projects.map((p) => p.completed), // [12, 8, 15, 5]
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Admin Dashboard</Text>

      {/* Overview Cards */}
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Projects</Text>
          <Text style={styles.cardValue}>12</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Users</Text>
          <Text style={styles.cardValue}>34</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completed Tasks</Text>
          <Text style={styles.cardValue}>42</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overdue Tasks</Text>
          <Text style={styles.cardValue}>3</Text>
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
      <Text style={styles.sectionTitle}>Project Progress (Completed Tasks)</Text>
      <BarChart
        data={progressData}
        width={screenWidth - 32}
        height={240}
        chartConfig={chartConfig}
        style={{ borderRadius: 12 }}
        fromZero
        showValuesOnTopOfBars
        verticalLabelRotation={0} // labels are short (P1,P2) so rotation unnecessary
      />

      {/* Legend mapping project IDs -> full names */}
      <View style={styles.legendContainer}>
        {projects.map((p) => (
          <View style={styles.legendItem} key={p.id}>
            <View style={[styles.legendColorBox, { backgroundColor: p.color }]} />
            <Text style={styles.legendText}>
              {p.id} — {p.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.listItem}>
        <Text style={styles.listText}>✔ Task completed by John</Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>⚠ Project Beta deadline in 3 days</Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>+ New user added: Maria</Text>
      </View>
    </ScrollView>
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
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    marginBottom: 8,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 8,
  },
  legendText: {
    color: "#EEEEEE",
    fontSize: 13,
  },
});
