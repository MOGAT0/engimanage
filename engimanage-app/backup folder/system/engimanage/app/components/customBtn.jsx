import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

const CustomBtn = ({ btnText, onClick, show }) => {

  return (
    <TouchableOpacity
      style={[styles.btn,{backgroundColor: show ? "grey" : "#331177"}]}
      onPress={onClick}
      disabled={show}
    >
      <Text style={styles.txt}>{btnText}</Text>
    </TouchableOpacity>
  );
};

export default CustomBtn;

const styles = StyleSheet.create({
  btn: {
    alignSelf: "flex-start",
    padding: 10,
  },
  txt: {
    color: "#ffff"
  },
});
