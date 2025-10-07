import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import Container, { Toast } from "toastify-react-native";
import Quantity from '../components/quantity';
import * as Securestore from 'expo-secure-store';
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";

import globalScript from '../globals/globalScript';

const link = globalScript
const server_link = `${link.serverLink}/`;

const screenWidth = Dimensions.get('window').width;
const itemWidth = screenWidth / 2 - 20;

const Purchase_orders = () => {  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isQuantityVisible, setQuantityVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [employeeID , setEmployeeID] = useState(null);

  useEffect(() => {
    const getLoginID = async () => {
      try {
        const storedData = await Securestore.getItemAsync('loginData');
        if(storedData){
          const parsedData = JSON.parse(storedData);
          setEmployeeID(parsedData.ID);
          console.log(storedData);
          
        }
      } catch (error) {
        console.log(error);
        
      }
    }

    getLoginID();
  }, [])
  

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${server_link}api/get_products`);
      if (!response.ok) throw new Error("Failed to fetch products");

      const result = await response.json();
      setProducts(result);

    } catch (error) {
      console.log("Error fetching products:", error);
    }
  };

  const handleAddToCart = (item) => {
    // console.log(item);
    
    setSelectedItem(item);
    setQuantityVisible(true);
  };

  const handleConfirmQuantity = (quantity) => {
    // console.log(quantity);
    
    setQuantityVisible(false);
    Toast.success(`${selectedItem.name} x${quantity} added to cart`);
  };

  return (
    <View style={styles.container}>
      <Container position='top' showCloseIcon={false} />
      <FlatList
        numColumns={2}
        data={products}
        keyExtractor={(item) => item.ID.toString()}
        columnWrapperStyle={styles.row}
        
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Image style={styles.imageIcon} source={{ uri: `${server_link}${item.path}` }} />
            <Text style={styles.itemTxt}>{item.name}</Text>
            <Text style={styles.itemPrice}>₱ {item.price}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => handleAddToCart(item)}>
              <Text style={styles.btnText}>Acquire</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={styles.cartBTN} onPress={() => router.navigate('tools/expense_claims')
      }>
        <Ionicons name="cart" size={30} color={"white"} />
      </TouchableOpacity>

      {isQuantityVisible && selectedItem && (
        <Modal transparent={true} animationType="fade">
          <Quantity
            employeeID = {employeeID}
            imgPath={selectedItem.path}
            itemName={selectedItem.name}
            itemPrice={selectedItem.price}
            // projectID={selectedIt}
            onClose={() => setQuantityVisible(false)}
            onConfirm={handleConfirmQuantity}
          />
        </Modal>
      )}
    </View>
  );
};

export default Purchase_orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: itemWidth,
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageIcon: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
    borderRadius: 5,
  },
  itemTxt: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: "#444",
    marginBottom: 5,
  },
  btn: {
    width: "100%",
    paddingVertical: 8,
    backgroundColor: "#331177",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  cartBTN:{
    zIndex:1,
    justifyContent:"center",
    alignItems:"center",
    position:"absolute",
    width:50,
    height:50,
    backgroundColor:"black",
    bottom: 50,
    right: 20,
    borderRadius:10,
    display:'none'
  },
});
