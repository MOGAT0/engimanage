import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { React, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

const PasswordField = ({
  val,
  handleChange,
  iconSize,
  iconColor,
  hintText,
  css,
}) => {
    const [showpass,setShowpass] = useState(false);
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textField}
        placeholder={hintText}
        secureTextEntry={!showpass}

        onChangeText={handleChange}
        value={val}
      />
      <TouchableOpacity onPress={() => setShowpass(!showpass)}>
        <Ionicons name={showpass ? "eye-off-outline" : "eye-outline"} size={iconSize} color={showpass ? "red" : iconColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth:1,
    justifyContent:"space-between",
    alignItems:'center',
    paddingHorizontal:10,
    borderRadius: 20,
    borderColor: "#c0c0c0",
    fontSize: 14,
  },
  textField:{
    flex:1,
    height:45,
  },

});

export default PasswordField;
