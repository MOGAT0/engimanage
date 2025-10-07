import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { LineChart } from "react-native-chart-kit";
import globalScript from "../globals/globalScript";
import { useLocalSearchParams } from "expo-router";
import CustomHeader from "../components/customHeader";

const link = globalScript;
const screenWidth = Dimensions.get("window").width;
const randomColors = ["#ff7675", "#74b9ff", "#55efc4", "#ffeaa7", "#a29bfe"];

const CustomProgressBar = ({ progress }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
  </View>
);

const DashboardPage = () => {
  const { projectID } = useLocalSearchParams();

  const [projects] = useState([
    { id: "1", name: "Warehouse Expansion", progress: 70, status: "Ongoing" },
    { id: "2", name: "Logistics Upgrade", progress: 90, status: "Completed" },
    { id: "3", name: "Security Enhancement", progress: 30, status: "Pending" },
  ]);

  const [chartData] = useState({
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [{ data: [3, 6, 9, 17, 23, 10, 11, 13, 23, 5, 3, 12] }],
  });

  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectprogress,setProjectprogress] = useState(0);


  const get_projectProgress = async () => {
    try {
      const response = await fetch(`${link.api_link}/getProjectProgress`,{
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectID }),
      })

      const data = await response.json();
      console.log(Math.round(data.result[0].progress));

      if(data.ok){
        setProjectprogress(Math.round(data.result[0].progress));
      }else{
        setProjectprogress(0);
      }
      
      

    } catch (error) {
      console.log(error);
      
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      get_projectProgress();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log(`Project ID: ${projectID}`);

    let interval;

    const fetchTasks = async () => {
      try {
        const response = await fetch(`${link.api_link}/getAssignedTasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectID }),
        });

        const json = await response.json();
        if (!json.ok) {
          setLoading(false);
          return;
        }

        const data = json.data;

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
        console.log("Error fetching tasks:", err);
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
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.deadline}>Assigned Tasks:</Text>
        </View>
      </View>

      <View style={styles.taskContainer}>
        {item.tasks.map((task, index) => (
          <View key={index} style={styles.taskBubble}>
            <TouchableOpacity style={styles.taskText}>
              <Text>{task}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="Project" routePath={"tabsHandler"} backName="Home" />
      {/* Generate Report Button */}
      <TouchableOpacity
        style={styles.reportButton}
        onPress={async () => {
          try {
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, "-");

            const csvHeader = "Task Name,Progress (%),Status\n";
            const projectRows = projects
              .map((p) => `${p.name},${p.progress},${p.status}`)
              .join("\n");

            const yearlyActivityHeader =
              "\n\nYearly Task Completions\nMonth,Activity (%)\n";
            const yearlyActivityRows = chartData.labels
              .map(
                (month, idx) => `${month},${chartData.datasets[0].data[idx]}`
              )
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

      <FlatList
        data={loading ? [] : groupedData}
        keyExtractor={(item) => item.assignedto.toString()}
        renderItem={renderCard}
        contentContainerStyle={styles.flatlist}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : (
            <View style={styles.noTaskContainer}>
              <Ionicons
                name="warning"
                size={24}
                color="orange"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.noTaskText}>No one claim the tasks</Text>
            </View>
          )
        }
        ListHeaderComponent={
          <View>
            {/* Project Progress */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <Ionicons
                name="stats-chart"
                size={20}
                color="#332277"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.title}>Progress</Text>
            </View>
            <Text style={styles.subtitle}>
              Complete: {projectprogress}% | Incomplete: {100 - projectprogress}%
            </Text>
            <CustomProgressBar progress={projectprogress} />
            

            {/* Task Completions per Month */}
            {/* <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
                marginBottom: 5,
              }}
            >
              <Ionicons
                name="trending-up"
                size={20}
                color="#332277"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.title}>Task Completions</Text>
            </View> */}
            {/* graph */}
            {/* <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ borderWidth: 1, borderRadius: 10, elevation: 3 }}
            >
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
            </ScrollView> */}

            {/* Assigned Tasks Section Title */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
                marginBottom: 5,
              }}
            >
              <Ionicons
                name="list"
                size={20}
                color="#332277"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.title}>Assigned Tasks</Text>
            </View>
          </View>
        }
      />
    </View>
  );
};

export default DashboardPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:10,
    backgroundColor: "#fff",
  },
  flatlist: {
    padding: 10,
    paddingBottom: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
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
    top: 100,
  },
  reportButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTaskContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noTaskText: {
    fontSize: 16,
    fontWeight: "600",
    color: "red",
  },
});
