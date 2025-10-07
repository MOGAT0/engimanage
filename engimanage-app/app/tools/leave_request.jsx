import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import BUTTON from "../components/customBtn";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import Container ,{ Toast } from "toastify-react-native";

const Leave_request = () => {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedvalue, setSelectedvalue] = useState("");
  const [message,setMessage] = useState("");

  const onChangeFrom = (event, selectedDate) => {
    setShowFromPicker(false);
    if (selectedDate) setFromDate(selectedDate);
  };

  const onChangeTo = (event, selectedDate) => {
    setShowToPicker(false);
    if (selectedDate) setToDate(selectedDate);
  };

  const handle_submit = () =>{
    Toast.success("Submitted");
    setSelectedvalue("");
    setMessage("");
    setFromDate(new Date());
    setToDate(new Date());
  }

  return (
    <View style={styles.container}>
      <Container position="top" showCloseIcon={true}/>
      <View style={styles.box}>
        <TextInput
          value={message}
          style={styles.textInput}
          multiline={true}
          placeholder={"Message"}
          numberOfLines={5}
          onChange={setMessage}
        />

        <View style={styles.dropDown}>
          <Picker
            selectedValue={selectedvalue}
            onValueChange={(itemValue) => {
              setSelectedvalue(itemValue);
            }}
          >
            <Picker.Item label="Reason" value={"0"}/>
            <Picker.Item label="Emergency" value={"1"}/>
            <Picker.Item label="Medical" value={"2"}/>
            <Picker.Item label="Vacation" value={"3"}/>
          </Picker>
        </View>

        <View style={styles.sched}>
          <View style={styles.schedField}>
            <Text>From: </Text>
            <TouchableOpacity onPress={() => setShowFromPicker(true)}>
              <TextInput
                style={styles.textField}
                placeholder="From"
                value={fromDate.toDateString()}
                editable={false}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.schedField}>
            <Text>To: </Text>
            <TouchableOpacity onPress={() => setShowToPicker(true)}>
              <TextInput
                style={styles.textField}
                placeholder="To"
                value={toDate.toDateString()}
                editable={false}
              />
            </TouchableOpacity>
          </View>
        </View>

        {showFromPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            onChange={onChangeFrom}
          />
        )}

        {showToPicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            display="default"
            onChange={onChangeTo}
          />
        )}

        <BUTTON btnText={"Submit"} onClick={handle_submit}/>
      </View>
    </View>
  );
};

export default Leave_request;

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 17,
    borderRadius: 5,
  },
  sched: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  schedField: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    height: 50,
  },
  textField: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    flex: 1,
    textAlign: "center",
  },
  box: {
    borderRadius: 10,
    padding: 20,
    backgroundColor: "#ffffff",
    elevation: 3,
    width: 300,
  },
  dropDown:{
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding:0,
    marginBottom:10
  }
});
