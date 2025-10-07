import { StyleSheet, Text, View, ScrollView, Alert,TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import DataSecureStorage from "./components/DataSecureStorage";
import globalScript from "./globals/globalScript";
import CustomHeader from "./components/customHeader";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";

import Request from "./components/request";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const link = globalScript;
const Notif = ({ projectID, homeRoute, userType }) => {
  // const { homeRoute_parameter } = useLocalSearchParams();
  const [notif, setNotif] = useState([]);
  const [employeeID, setEmployeeID] = useState(null);

  const fetchData = async () => {
    try {
      const securedata = await DataSecureStorage.getItem(
        userType === "admin" ? "adminLoginData" : "loginData"
      );
      const userData = JSON.parse(securedata);
      const empID = userData.ID;

      setEmployeeID(empID);

      const res = await fetch(`${link.api_link}/get_notif`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_ID: empID,
          projectID: projectID,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setNotif(data.result);
      } else {
        console.log("Fetch failed:", data.message);
      }
    } catch (err) {
      console.log("Error fetching notif:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (notif_id) => {
    try {
      const res = await fetch(`${link.api_link}/update_req`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notif_id, req_status: "accepted" }),
      });

      const data = await res.json();
      if (data.ok) {
        alert("Accepted");
        fetchData();
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      console.log("Error accepting:", err);
    }
  };

  const handleReject = async (notif_id) => {
    try {
      const res = await fetch(`${link.api_link}/update_req`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notif_id, req_status: "rejected" }),
      });

      const data = await res.json();
      if (data.ok) {
        alert("Rejected");
        fetchData();
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      console.log("Error rejecting:", err);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title={"Notifications"}
        backName="Home"
        routePath={homeRoute}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 ,paddingBottom: 100}}>
        {notif.map((n) => {
          switch (n.notif_category) {
            case "overdue":
              return (
                <TouchableOpacity 
                  onPress={() =>
                    router.navigate({
                      pathname: "project_components/taskView",
                      params: {
                        task_id: n.task_id,
                      },
                    })
                  }
                  key={n.notif_id} 
                  style={styles.notif_alert}
                >
                  <View style={{ marginRight: 12 }}>
                    <Ionicons name="alert-circle" size={30} color="red" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      {n.context.replace(/_/g, " ")}
                    </Text>
                    <Text style={{ color: "#666", fontSize: 12 }}>
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString()
                        : "Just now"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );

            case "completed":
              return (
                <TouchableOpacity 
                  onPress={() =>
                    router.navigate({
                      pathname: "project_components/taskView",
                      params: {
                        task_id: n.task_id,
                      },
                    })
                  }
                  key={n.notif_id} 
                  style={[styles.notif_alert,{borderColor:"green"}]}>
                  <View style={{ marginRight: 12 }}>
                    <Ionicons name="checkmark-circle" size={30} color="green" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      {n.context.replace(/_/g, " ")}
                    </Text>
                    <Text style={{ color: "#666", fontSize: 12 }}>
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString()
                        : "Just now"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );

            default:
              return (
                <Request
                  key={n.notif_id}
                  context={n.context.replace(/_/g, " ")}
                  isSender={n.isSender}
                  isReceiver={n.isReceiver}
                  status={n.req_status}
                  onAccept={() => handleAccept(n.notif_id)}
                  onReject={() => handleReject(n.notif_id)}
                  created_at={n.created_at}
                />
              );
          }
        })}
      </ScrollView>
    </View>
  );
};

export default Notif;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  notif_alert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    paddingVertical: 25,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "red",
  },
});
