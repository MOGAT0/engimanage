import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const CustomProgressBar = ({ progress }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
  </View>
);

const DashboardPage = () => {
  const [projects] = useState([
    { id: "1", name: "Warehouse Expansion", progress: 70, status: "Ongoing" },
    { id: "2", name: "Logistics Upgrade", progress: 90, status: "Completed" },
    { id: "3", name: "Security Enhancement", progress: 30, status: "Pending" },
  ]);

  const [chartData] = useState({
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [{ data: [3, 6, 9, 17, 23, 10, 11, 13, 23, 5, 3, 12] }],
  });

  return (
    <>
      <TouchableOpacity
        style={styles.reportButton}
        onPress={async () => {
          try {
            // para sa naming
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, "-");

            // Report header
            const csvHeader = "Task Name,Progress (%),Status\n";

            // Ongoing nga tasks
            const projectRows = projects
              .map((p) => `${p.name},${p.progress},${p.status}`)
              .join("\n");

            // Yearly User Activity section
            const yearlyActivityHeader = "\n\nYearly Task Completions\nMonth,Activity (%)\n";
            const yearlyActivityRows = chartData.labels
              .map((month, idx) => `${month},${chartData.datasets[0].data[idx]}`)
              .join("\n");

            const csvContent = `${csvHeader}${projectRows}${yearlyActivityHeader}${yearlyActivityRows}`;


            const fileUri =
              FileSystem.documentDirectory + `Engimanage_report.csv`;

            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
              encoding: FileSystem.EncodingType.UTF8,
            });

            await Sharing.shareAsync(fileUri);
          } catch (error) {
            console.error("CSV export error:", error);
            Alert.alert("Error", "Failed to export report.");
          }
        }}
      >
        <Ionicons name="document-text-outline" size={20} color="#fff" />
        <Text style={styles.reportButtonText}>Generate Report</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View>
              {/* Project Progress */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                <Ionicons name="stats-chart" size={20} color="#332277" style={{ marginRight: 6, marginTop: 15 }} />
                <Text style={styles.title}>Project Progress</Text>
              </View>
              <Text style={styles.subtitle}>Completed: 60% | Incomplete: 40%</Text>
              <CustomProgressBar progress={60} />

              {/* Task Completions per Month (Line Graph) */}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 15, marginBottom: 5 }}>
                <Ionicons name="trending-up" size={20} color="#332277" style={{ marginRight: 6, marginTop: 20 }} />
                <Text style={styles.title}>Task Completions</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderWidth: 1, borderRadius: 10, elevation: 3 }}>
                <LineChart
                  data={chartData}
                  width={screenWidth * 1.5}
                  height={220}
                  yAxisSuffix=""
                  fromZero
                  chartConfig={{
                    backgroundColor: "#f4f4f4",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: () => "#332277",
                    labelColor: () => "#555",
                    propsForDots: {
                      r: "5",
                      strokeWidth: "2",
                      stroke: "#332277",
                    },
                  }}
                  bezier
                />
              </ScrollView>

              {/* Ongoing Tasks */}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 15, marginBottom: 5 }}>
                <Ionicons name="list" size={20} color="#332277" style={{ marginRight: 6, marginTop: 20 }} />
                <Text style={styles.title}>Ongoing Tasks</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.projectCard}>
              <Text style={styles.projectName}>{item.name}</Text>
              <CustomProgressBar progress={item.progress} />
              <Text style={styles.status}>{item.progress}% - {item.status}</Text>
            </View>
          )}
          contentContainerStyle={styles.flatlist}
        />
      </View>
    </>
  );
};

export default DashboardPage;

const styles = StyleSheet.create({
  container: {
    marginTop: -20,
    flex: 1,
  },
  flatlist: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
  },
  projectCard: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  projectName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#332277",
  },
  reportButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    elevation: 4,
    zIndex: 1,
    position: "absolute",
    right: 20,
    top: 10,
  },
  reportButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
