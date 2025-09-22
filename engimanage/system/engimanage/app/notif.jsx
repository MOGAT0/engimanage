import { StyleSheet, Text, View, ScrollView, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import DataSecureStorage from "./components/DataSecureStorage";
import globalScript from "./globals/globalScript";
import CustomHeader from "./components/customHeader";
import { useLocalSearchParams } from "expo-router";

import Request from "./components/request";

const link = globalScript;
const Notif = () => {
  const { projectID } = useLocalSearchParams();
  const [notif, setNotif] = useState([]);
  const [employeeID, setEmployeeID] = useState(null);

  const fetchData = async () => {
    try {
      const securedata = await DataSecureStorage.getItem("loginData");
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
        console.error("Fetch failed:", data.message);
      }
    } catch (err) {
      console.error("Error fetching notif:", err);
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
      console.error("Error accepting:", err);
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
      console.error("Error rejecting:", err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <CustomHeader title={"Notifications"} backName="Home" routePath={"tabsHandler"} />
      {notif.map((notif) => (
        <Request
          key={notif.notif_id}
          context={notif.context}
          isSender={notif.isSender}
          isReceiver={notif.isReceiver}
          status={notif.req_status}
          onAccept={() => handleAccept(notif.notif_id)}
          onReject={() => handleReject(notif.notif_id)}
        />
      ))}
    </ScrollView>
  );
};

export default Notif;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
});
