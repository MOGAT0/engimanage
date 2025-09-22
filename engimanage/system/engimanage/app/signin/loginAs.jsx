// removed ! -------------------------------------------------------------------------------------->


import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { router } from "expo-router";

const LoginAs = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login As</Text>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: '#fff', borderColor:"#28a745",borderWidth:1}]}
        onPress={() => router.navigate('./adminLogin')}
      >
        <Text style={[styles.cardText,{color:"#28a745" }]}>Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: '#fff', borderColor:"#331177",borderWidth:1 }]}
        onPress={() => router.navigate('./login')}
      >
        <Text style={styles.cardText}>Employee</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={[styles.card, { backgroundColor: '#fff', borderColor:"#331177",borderWidth:1 }]}
        onPress={() => router.navigate('./supplierLogin')}
      >
        <Text style={styles.cardText}>Supplier</Text>
      </TouchableOpacity> */}

      {/* <TouchableOpacity
        style={[styles.card, { backgroundColor: '#fff', borderColor:"#331177",borderWidth:1 }]}
        // onPress={() => router.navigate('./supplierLogin')}
      >
        <Text style={styles.cardText}>Finance</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default LoginAs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  card: {
    width: '80%',
    paddingVertical: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardText: {
    fontSize: 20,
    color: '#331177',
    fontWeight: '600',
  },
});
