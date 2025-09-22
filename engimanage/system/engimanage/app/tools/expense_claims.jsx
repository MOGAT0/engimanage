import {
  Image,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import Br from "../components/spacer";
import { router } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Securestore from 'expo-secure-store';

import globalScript from "../globals/globalScript";

const link = globalScript

const Expense_claims = () => {
  const [expenseData, setExpenseData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [employeeID, setEmployeeID] = useState(null);

  useEffect(() => {
    const getLoginID = async () => {
      try {
        const storedData = await Securestore.getItemAsync("loginData");
        if(storedData){
          const parsedData = JSON.parse(storedData);
          setEmployeeID(parsedData.ID);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getLoginID();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${link.api_link}/getExpenses`);
        const data = await response.json();
        setExpenseData(data);
        calculateTotal(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const calculateTotal = (data) => {
    let total = data.reduce((sum, item) => sum + item.price, 0);
    setTotalAmount(total);
  };

  const updateQuantity = async (id, newQuantity) => {
    console.log(newQuantity);
    

    if (newQuantity < 1) return;
    try {
      await fetch(`${link.api_link}/updateQuantity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity: newQuantity, employeeID }),
      });
      const updatedData = expenseData.map((item) =>
        item.id === id
          ? {
              ...item,
              pcs: newQuantity,
              price: (item.price / item.pcs) * newQuantity,
            }
          : item
      );
      setExpenseData(updatedData);
      calculateTotal(updatedData);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`${link.api_link}/deleteItem`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const updatedData = expenseData.filter((item) => item.id !== id);
      setExpenseData(updatedData);
      calculateTotal(updatedData);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleTXT}>Summary</Text>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={expenseData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.summaryBoard}>
            <Image
              style={styles.icon}
              source={{ uri:`${link.serverLink}/${item.icon}` }}
            />
            <View style={styles.productDet}>
              <Text style={{ fontSize: 15 }}>{item.name}</Text>
              <Text style={{ fontSize: 15 }}>₱ {item.price.toLocaleString()}</Text>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.pcs - 1)}
                >
                  <Text style={styles.qtyButton}>-</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 15 }}>{item.pcs}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.pcs + 1)}
                >
                  <Text style={styles.qtyButton}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteItem(item.id)}>
                  <Ionicons name="trash" size={30} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        style={styles.itemLists}
      />
      <Br customHeight={30} />
      <View style={styles.lowerPart}>
        <Text style={styles.totalTXT}>Total: ₱{totalAmount.toLocaleString()}</Text>
        <Br customHeight={30} />
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.navigate("/expense_claims/PaymentPage")}
        >
          <Text style={{ color: "white" }}>Continue To Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Expense_claims;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  summaryBoard: {
    flexDirection: "row",
    margin: 10,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 10,
    objectFit: "cover",
    elevation: 3,
  },
  productDet: {
    marginLeft: 30,
  },
  titleTXT: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#331177",
  },
  lowerPart: {
    justifyContent: "center",
    alignItems: "center",
  },
  totalTXT: {
    fontSize: 20,
    color: "#331177",
  },
  continueBtn: {
    backgroundColor: "#331177",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    borderRadius: 5,
  },
  qtyControls: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 5 
  },
  qtyButton: {
    fontSize: 20,
    paddingHorizontal: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginHorizontal:10
  },
  itemLists:{
    maxHeight:450,
    backgroundColor:"#ffff",
    elevation:3,
    borderRadius:10
  },
});