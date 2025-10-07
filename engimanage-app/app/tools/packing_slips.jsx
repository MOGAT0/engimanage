import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Br from '../components/spacer'

const Packing_slips = () => {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.headerTxt}>Packing Slip for Order [order number]</Text>
        <Br customHeight={20}/>
        {/* <Text style={styles.companyDetailsTXT}>Livingstone Building NZ Ltd 70 Maui Street, Pukete, Hamilton 3200, New Zealand</Text> */}
        <Br customHeight={20}/>
        <Text style={styles.context}>Ship to: </Text>
        <Text style={styles.context}>Order ID: </Text>
        <Text style={styles.context}>Order Date: </Text>
        <Text style={styles.context}>Serial Number: </Text>

        <Br customHeight={50}/>
        <View style={styles.line}></View>
        <Br customHeight={10}/>

        <View style={styles.recieptContent}>
          <Text style={styles.recieptContentHeader}>Item</Text>
          <Text style={styles.recieptContentHeader}>QYT</Text>
          <Text style={styles.recieptContentHeader}>Price</Text>
          <Text style={styles.recieptContentHeader}>Total</Text>
        </View>

        <Br customHeight={150}/>
        <View style={styles.line}></View>
        <Br customHeight={10}/>

        <View style={styles.recieptContentTotal}>
          <Text style={styles.recieptContentHeader}>SubTotal:</Text>
          <Text style={styles.recieptContentHeader}>Tax:</Text>
          <Text style={styles.recieptContentHeader}>Total:</Text>

        </View>
      </View>
    </View>
  );
};

export default Packing_slips;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  box:{
    flex:1,
    borderWidth:1,

    width:"95%",
    margin:20,
    padding:10
  },
  headerTxt:{
    backgroundColor:"#ccc",
    padding:10,
    width:"100%",
    fontSize:13,
    textAlign:"center",
    fontWeight:"bold"
  },
  companyDetailsTXT:{
    fontSize:12,
    textAlign:"center",
    width:250,
    marginRight:"auto",
    marginLeft:"auto"
  },
  context:{
    fontSize:13,
    fontWeight:"bold",
  },
  line:{
    borderWidth:0.5,
  },
  recieptContent:{
    flexDirection:"row",
    justifyContent:"space-around",
    alignContent:"center",
  },
  recieptContentHeader:{
    fontWeight:"bold"
  },
  recieptContentTotal:{
    fontWeight:"bold"
  }
});
