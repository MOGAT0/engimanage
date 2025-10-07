import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

import globalScript from "../globals/globalScript";

const link = globalScript

const Duty_logs = () => {
  const [datalogs, setDatalogs] = useState([]);
  const [employeeID, setEmployeeID] = useState("");

  useEffect(() => {
    const getLoginID = async () => {
      try {
        const storedData = await SecureStore.getItemAsync("loginData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setEmployeeID(parsedData.ID);
        }
      } catch (error) {
        console.error("Error fetching login ID:", error);
      }
    };

    getLoginID();
  }, []);

  useEffect(() => {
    if (!employeeID) return;

    const fetch_dutylogs = async () => {
      try {
        const reqData = { employeeID };

        const response = await fetch(`${link.serverLink}/api/dutylogs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(reqData),
        });

        const data = await response.json();
        setDatalogs(data);
      } catch (error) {
        console.error("server error", error);
      }
    };

    fetch_dutylogs();
  }, [employeeID]);

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTxt}>Date</Text>
        <Text style={styles.headerTxt}>Time-in</Text>
        <Text style={styles.headerTxt}>Time-out</Text>
        <Text style={styles.headerTxt}>Rendered Time</Text>
      </View>

      <FlatList
        data={datalogs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item.log_date}</Text>
            <Text style={styles.text}>{item.time_in}</Text>
            <Text style={styles.text}>{item.time_out}</Text>
            <Text style={styles.text}>{item.duty_hours}</Text>
          </View>
        )}
        contentContainerStyle={styles.container}
      />
    </View>
  );
};

export default Duty_logs;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    backgroundColor: "white",
    margin: 5,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 1,
    elevation: 3,
    flexDirection: "row",
  },
  text: {
    fontSize: 15,
    color: "#333",
    marginHorizontal:15,
  },
  header: {
    backgroundColor: "#331177",
    margin: 5,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-evenly",
    borderRadius: 1,
    elevation: 3,
    flexDirection: "row",
  },
  headerTxt: {
    fontSize:15,
    color: "#ffff",
    paddingHorizontal:15,
  },
});
