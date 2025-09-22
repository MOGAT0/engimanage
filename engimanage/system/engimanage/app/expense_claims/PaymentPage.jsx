import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import Contaner, { Toast } from "toastify-react-native";

const paymentMethods = [
  { id: "1", name: "Debit / Credit card" },
  { id: "2", name: "Internet Banking" },
  { id: "3", name: "G Pay" },
  { id: "4", name: "PhonePe" },
  { id: "5", name: "Add another option" },
];

const PaymentPage = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  return (
    <View style={styles.container}>
      <Contaner position="top" showCloseIcon={false} />
      {!selectedMethod ? (
        <>
          <Text style={styles.title}>Choose Payment Option</Text>
          <FlatList
            data={paymentMethods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => setSelectedMethod(item.name)}
              >
                <Text style={styles.optionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>{selectedMethod}</Text>
          {selectedMethod === "Debit / Credit card" && (
            <View>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="XXXX XXXX XXXX XXXX"
                keyboardType="numeric"
                value={cardDetails.number}
                onChangeText={(text) =>
                  setCardDetails({ ...cardDetails, number: text })
                }
              />
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM / YY"
                keyboardType="numeric"
                value={cardDetails.expiry}
                onChangeText={(text) =>
                  setCardDetails({ ...cardDetails, expiry: text })
                }
              />
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="***"
                keyboardType="numeric"
                secureTextEntry
                value={cardDetails.cvv}
                onChangeText={(text) =>
                  setCardDetails({ ...cardDetails, cvv: text })
                }
              />
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                value={cardDetails.name}
                onChangeText={(text) =>
                  setCardDetails({ ...cardDetails, name: text })
                }
              />
            </View>
          )}
          <TouchableOpacity style={styles.payButton} onPress={()=> Toast.success("Success!")}>
            <Text style={styles.payText}>Pay Now</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedMethod(null)}>
            <Text style={styles.cancelText}>Cancel Payment</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default PaymentPage;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  option: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: { fontSize: 16 },
  label: { fontSize: 14, fontWeight: "bold", marginTop: 10 },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  payButton: {
    backgroundColor: "#331177",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  payText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  cancelText: { color: "red", textAlign: "center", marginTop: 10 },
});
