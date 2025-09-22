import { StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import React from "react";

const ProjectPanel = ({onClick, css ,pname,pmanager, txtstyle,joined}) => {
  return (
    <TouchableOpacity onPress={onClick} style={styles.panelContainer}>
      <Text style={styles.pnameText}>{pname}</Text>
      <Text style={styles.pmanagerText}>{pmanager}</Text>
      <Text style={joined? styles.join : styles.others}>Joined</Text>
    </TouchableOpacity>
  );
};

export default ProjectPanel;

const styles = StyleSheet.create({
  panelContainer: {
    flexDirection: 'column',
    backgroundColor: '#f5f3fa',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#332277',
    borderRadius: 5,
    elevation: 2,
  },
  join:{
    borderWidth:1,
    backgroundColor:"transparent",
    borderColor:"#28a745",
    position:"absolute",
    right:20,
    bottom:29,
    top:29,
    fontSize:15,
    height:21,
    width:60,
    borderRadius:50,
    textAlign:'center',
    color:'#28a745',
  },
  others:{
    borderWidth:1,
    width:20,
    borderRadius:50,
    backgroundColor:"red",
    borderColor:"red",
    position:"absolute",
    right:20,
    bottom:29,
    top:29,
    display:'none',
  },
  txt: {
    marginVertical: 2,
  },
  pnameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#332277',
    marginBottom: 4,
  },
  pmanagerText: {
    fontSize: 16,
    color: '#fffff',
  },
});
