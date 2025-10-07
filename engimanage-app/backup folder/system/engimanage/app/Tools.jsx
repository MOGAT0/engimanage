import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { React, useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import Container ,{ Toast } from "toastify-react-native";
import { router } from "expo-router";

const Tools = ({projectID}) => {
  console.log(projectID);
  const IconColor = "#331177";
  const IconSize = 80;

  return (
    <View style={styles.container}>
      <View style={styles.colStyle}>
 
        <TouchableOpacity style={styles.itemsStyles} onPress={()=> {
          router.push("tools/expense_claims")
        }}>
          <Ionicons name="card-outline" size={IconSize} color={IconColor}/>
          <Text style={styles.textsStyle}>Expense Claims</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemsStyles} onPress={()=>{
          router.push("tools/packing_slips")
        }}>
          <Ionicons name="newspaper-outline" size={IconSize} color={IconColor}/>
          <Text style={styles.textsStyle}>Packing Slips</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemsStyles} onPress={()=>{
          router.push("tools/leave_request")
        }}>
          <Ionicons name="footsteps-outline" size={IconSize} color={IconColor}/>
          <Text style={styles.textsStyle}>Leave Request</Text>
        </TouchableOpacity>

      </View>

      <View style={styles.colStyle}>
        {/* tools/purchase_orders */}
        <TouchableOpacity style={styles.itemsStyles} onPress={()=>{
          router.push("tools/select_supplier")
        }}>
          <Ionicons name="cart-outline" size={IconSize} color={IconColor}/>
          <Text style={styles.textsStyle}>Purchase Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemsStyles} onPress={()=>{
          router.push("tools/time_sheets")
        }}>
          <Ionicons name="time-outline" size={IconSize} color={IconColor}/>
          <Text style={styles.textsStyle}>Time Sheets</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemsStyles} onPress={()=>{
          router.push("tools/yard_booking")
        }}>
          <Ionicons name="calendar-outline" size={IconSize} color={IconColor}/>
          <Text style={styles.textsStyle}>Yard Booking</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius:10,
  },
  textsStyle:{
    fontSize:15,
    color:"grey"
  }
});

export default Tools;
