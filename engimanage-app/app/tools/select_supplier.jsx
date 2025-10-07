import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const suppliers = [
  { id: '1', name: 'Ace Hardware Supplies', logo: '' },
  { id: '2', name: 'Techtronics Inc', logo: '' },
  { id: '3', name: 'MegaBuild Corp', logo: '' },
];

const Select_supplier = () => {
  const handleSelect = (supplier) => {
    console.log('Selected Supplier:', supplier.name);
    switch(supplier.name){
        case "Ace Hardware Supplies":
            router.navigate("tools/purchase_orders");
            break;
        case "":
            break;
        case "":
            break;
        default:
            "";
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelect(item)}>
      {item.logo ? (
        <Image source={{ uri: item.logo }} style={styles.logo} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={30} color="#aaa" />
        </View>
      )}
      <Text style={styles.companyName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Supplier</Text>
      <FlatList
        data={suppliers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default Select_supplier;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
