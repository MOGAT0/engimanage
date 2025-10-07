import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const warehouses = [
  { id: "1", name: "A", location: "New York", pricePerDay: 500 },
  { id: "2", name: "B", location: "Los Angeles", pricePerDay: 400 },
  { id: "3", name: "C", location: "Chicago", pricePerDay: 350 },
  { id: "4", name: "D", location: "New Zealand", pricePerDay: 550 },
  { id: "5", name: "E", location: "Switzerland", pricePerDay: 600 },
];

const Yard_booking = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const calculateTotalPrice = () => {
    if (!selectedWarehouse) return 0;
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    return days * selectedWarehouse.pricePerDay;
  };

  const handleBooking = () => {
    if (!selectedWarehouse) {
      Alert.alert("Error", "Please select a warehouse");
      return;
    }
    Alert.alert(
      "Booking Confirmed",
      `Warehouse: ${selectedWarehouse.name}\nLocation: ${
        selectedWarehouse.location
      }\nStart Date: ${startDate.toDateString()}\nEnd Date: ${endDate.toDateString()}\nTotal Price: ₱${calculateTotalPrice()}`
    );
  };

  return (
    <View style={styles.container}>
      {/* diri ni ma select sang warehouse */}
      <Text style={styles.subtitle}>Select a Warehouse:</Text>
      <FlatList
        data={warehouses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.warehouseItem,
              selectedWarehouse?.id === item.id && styles.selectedWarehouse,
            ]}
            onPress={() => setSelectedWarehouse(item)}
          >
            <Text style={styles.warehouseText}>
              {" "}
              ({item.location}) - ₱{item.pricePerDay}/day
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* pili sang start date */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowStartPicker(true)}
      >
        <Text style={styles.dateText}>
          Start Date: {startDate.toDateString()}
        </Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {/* pili sang end date */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowEndPicker(true)}
      >
        <Text style={styles.dateText}>End Date: {endDate.toDateString()}</Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      {/* e display ni ang total price */}
      {selectedWarehouse && (
        <Text style={styles.totalPrice}>
          Total Price: ₱{calculateTotalPrice().toLocaleString('en-PH')}
        </Text>
      )}

      {/* confirm chuchu */}
      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Text style={styles.bookText}>Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Yard_booking;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 5 },
  warehouseItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },
  selectedWarehouse: { backgroundColor: "#4CAF50" },
  warehouseText: { fontSize: 16, color: "#333" },
  dateButton: {
    padding: 12,
    backgroundColor: "#331177",
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  dateText: { color: "#fff", fontSize: 16 },
  totalPrice: { fontSize: 20, fontWeight: "bold", marginTop: 15 },
  bookButton: {
    padding: 15,
    backgroundColor: "#28A745",
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  bookText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
