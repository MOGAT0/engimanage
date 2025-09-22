import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const screenWidth = Dimensions.get("window").width;

const CustomProgressBar = ({ progress }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
  </View>
);

const DashboardPage = ({ projectID }) => {

  // update ni sunod using database data
  const [activeUsers, setActiveUsers] = useState(["Bob", "Kevin", "Stuart"]);
  const [inactiveUsers, setInactiveUsers] = useState(["Tom", "Jerry"]);
  const [projects, setProject] = useState([
    { id: "1", name: "Warehouse Expansion", progress: 70, status: "Ongoing" },
    { id: "2", name: "Logistics Upgrade", progress: 100, status: "Completed" },
    { id: "3", name: "Security Enhancement", progress: 30, status: "Pending" },
  ]);

  const [chartData, setChartData] = useState({
    labels: [
      "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
    ],
    datasets: [{
        data: [80, 60, 90, 70, 85, 80, 60, 90, 70, 85, 100, 0],
    }],
  });

  const activePercent = (activeUsers.length / (activeUsers.length + inactiveUsers.length)) * 100;
  const inactivePercent = 100 - activePercent;

  useEffect(()=>{
    
  },[])

  const getYearlyAct = ()=>{
    
  }

  return (
    <>
      <TouchableOpacity
        style={styles.reportButton}
        onPress={async () => {
          try {
            // para sa naming
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, "-");

            // Projects section
            const csvHeader = "Task Name,Progress,Status\n";
            const projectRows = projects
              .map(p => `${p.name},${p.progress},${p.status}`)
              .join("\n");

            // Active/inactive users section
            const activeRow = `\n\nActive Users (${activeUsers.length}):,${activeUsers.join(", ")}`;
            const inactiveRow = `\nInactive Users (${inactiveUsers.length}):,${inactiveUsers.join(", ")}`;

            // Yearly User Activity section
            const yearlyActivityHeader = "\n\nYearly User Activity\nMonth,Activity (%)\n";
            const yearlyActivityRows = chartData.labels
              .map((month, idx) => `${month},${chartData.datasets[0].data[idx]}`)
              .join("\n");

            // Current Month User Activity percentages
            const currentActivity = `\n\nCurrent Active Percentage\nActive (%),Inactive (%)\n${activePercent.toFixed(1)},${inactivePercent.toFixed(1)}`;

            // Combine na tanan
            const csvContent = `${csvHeader}${projectRows}${activeRow}${inactiveRow}${yearlyActivityHeader}${yearlyActivityRows}${currentActivity}`;

            const fileUri = FileSystem.documentDirectory + `project-report-${timestamp}.csv`;

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
                {/* para sa user Activity Chart (yearly) */}
                <Text style={styles.title}>📊 User Activity This Year</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={chartData}
                    width={screenWidth * 1.5}
                    height={220}
                    yAxisSuffix="%"
                    fromZero={true}
                    chartConfig={{
                      backgroundColor: "#f4f4f4",
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      decimalPlaces: 0,
                      color: () => "#4CAF50",
                      labelColor: () => "#555",
                    }}
                    style={{ marginVertical: 8, borderRadius: 10 }}
                  />
                </ScrollView>

                {/* Activity Percentage sang current user */}
                <Text style={styles.title}>📈 Current Active Percentage</Text>
                <Text style={styles.subtitle}>
                  Active: {activePercent.toFixed(0)}% | Inactive:{" "}
                  {inactivePercent.toFixed(0)}%
                </Text>
                <CustomProgressBar progress={activePercent} />

                <Text style={styles.title}>👥 Current Users</Text>
                <View style={styles.userSection}>
                  <View style={styles.userList}>
                    <Text style={styles.subtitle}>🟢 Active/Onsite</Text>
                    {activeUsers.map((user, i) => (
                      <Text key={i} style={styles.userName}>
                        {user}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.userList}>
                    <Text style={styles.subtitle}>🔴 Inactive</Text>
                    {inactiveUsers.map((user, i) => (
                      <Text key={i} style={styles.userName}>
                        {user}
                      </Text>
                    ))}
                  </View>
                </View>

                <Text style={styles.title}>📂 Project Progress</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.projectCard}>
                <Text style={styles.projectName}>{item.name}</Text>
                <CustomProgressBar progress={item.progress} />
                <Text style={styles.status}>
                  {item.progress}% - {item.status}
                </Text>
              </View>
            )}
            style={styles.flatlist}
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
  userSection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userList: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  userName: {
    fontSize: 14,
    marginVertical: 2,
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
    backgroundColor: "#4CAF50",
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
    zIndex:1,
    position:"absolute",
    right:20,
    top:10,
  },
  reportButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

});
