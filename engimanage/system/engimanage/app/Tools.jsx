import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { React, useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import Container, { Toast } from "toastify-react-native";
import { router } from "expo-router";
import CustomHeader from "./components/customHeader";

const Tools = ({ projectID }) => {
  console.log(projectID);
  const IconColor = "#331177";
  const IconSize = 80;

  return (
    <View style={styles.container}>
      <CustomHeader title="Tools" routePath={"tabsHandler"} backName="Home" />
      <View style={styles.body}>
        <View style={styles.colStyle}>
          <TouchableOpacity
            style={styles.itemsStyles}
            onPress={() => {
              router.navigate("tools/expense_claims");
            }}
          >
            <Ionicons name="card-outline" size={IconSize} color={IconColor} />
            <Text style={styles.textsStyle}>Expense Claims</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.itemsStyles}
            onPress={() => {
              router.navigate("tools/packing_slips");
            }}
          >
            <Ionicons
              name="newspaper-outline"
              size={IconSize}
              color={IconColor}
            />
            <Text style={styles.textsStyle}>Packing Slips</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.itemsStyles}
            onPress={() => {
              router.navigate("tools/leave_request");
            }}
          >
            <Ionicons
              name="footsteps-outline"
              size={IconSize}
              color={IconColor}
            />
            <Text style={styles.textsStyle}>Leave Request</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.colStyle}>
          {/* tools/purchase_orders */}
          <TouchableOpacity
            style={styles.itemsStyles}
            onPress={() => {
              router.navigate("tools/select_supplier");
            }}
          >
            <Ionicons name="cart-outline" size={IconSize} color={IconColor} />
            <Text style={styles.textsStyle}>Purchase Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.itemsStyles}
            onPress={() => {
              router.navigate("tools/time_sheets");
            }}
          >
            <Ionicons name="time-outline" size={IconSize} color={IconColor} />
            <Text style={styles.textsStyle}>Time Sheets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.itemsStyles}
            onPress={() => {
              router.navigate("tools/yard_booking");
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={IconSize}
              color={IconColor}
            />
            <Text style={styles.textsStyle}>Yard Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  body: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  colStyle: {
    flexDirection: "column",
    width: "40%",
    height: "80%",
    margin: 1,
    justifyContent: "space-between",
  },
  itemsStyles: {
    width: "100%",
    height: "30%",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation:3,
  },
  textsStyle: {
    fontSize: 15,
    color: "grey",
  },
});

export default Tools;
