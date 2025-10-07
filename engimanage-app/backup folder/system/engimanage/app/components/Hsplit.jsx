import { Text, View } from "react-native";
import React from "react";

const Hsplit = ({text}) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ flex: 1, height: 1, backgroundColor: "black" }} />
      <View style={{flex:0.5}}>
        <Text style={{ textAlign: "center" }}>{text}</Text>
      </View>
      <View style={{ flex: 1, height: 1, backgroundColor: "black" }} />
    </View>
  );
};

export default Hsplit;
