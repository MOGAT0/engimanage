import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

import Counter from "../project_components/timer"; // timer

import globalScript from "../globals/globalScript";

const link = globalScript;


const Time_sheets = () => {

  const [timein, setTimein] = useState(null);
  const [timeout, setTimeout] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [dutyHours, setDutyHours] = useState("");
  
  const [employeeID, setEmployeeID] = useState(null);
  const [tick, setTick] = useState(0);
  const [btnName, setBtnName] = useState("Time in");
  const [showBTN, setShowBTN] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const [getInfo, setInfo] = useState();


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(() => {
        const date = new Date();
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      
      const fetchData = async () => {
        try {
          const storedData = await SecureStore.getItemAsync("loginData");
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            const infoKey = `${parsedData.fname.replace(/\s/g,'_')}${parsedData.ID}`;            
            setEmployeeID(parsedData.ID);
            setInfo(infoKey);
  
            const savedTimeData = await SecureStore.getItemAsync(infoKey);
            if (savedTimeData && isActive) {
              const parsedTimeData = JSON.parse(savedTimeData);
              if (parsedTimeData.timein) setTimein(parsedTimeData.timein);
              if (parsedTimeData.isRunning !== undefined) {
                setIsRunning(parsedTimeData.isRunning);
                setTick(parsedTimeData.isRunning ? 1 : 0);
                setBtnName(parsedTimeData.isRunning ? "Time out" : "Time in");
              }
            }
          }
        } catch (error) {
          console.error("Error Loading Data: ", error);
        }
      };
  
      fetchData();
      console.log("enter");
  
      return () => {
        console.log("exit");
        isActive = false;
      };
    }, [])
  );

  const getTimeStamp = () => {
    const date = new Date();
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  };

  const handleTimeStamp = async () => {
    const now = getTimeStamp();
  
    if (tick === 0) {
      // TIME IN
      setTimein(now);
      setTimeout(null);
      setBtnName("Time out");
      setTick(1);
      setIsRunning(true);
  
      // Save immediately when timing in
      if (getInfo) {
        try {
          await SecureStore.setItemAsync(getInfo, JSON.stringify({ timein: now, isRunning: true }));
        } catch (error) {
          console.error("Error saving timein: ", error);
        }
      }
  
    } else {
      // TIME OUT
      setTimeout(now);
      setBtnName("Time in");
      setTick(0);
      setIsRunning(false);
      setShowBTN(true);
  
      // calculate duty hours
      const start = new Date();
      const end = new Date();
  
      const [startHours, startMinutes, startSeconds] = timein.split(":").map(Number);
      const [endHours, endMinutes, endSeconds] = now.split(":").map(Number);
  
      start.setHours(startHours, startMinutes, startSeconds);
      end.setHours(endHours, endMinutes, endSeconds);
  
      const durationMs = end - start;
      const durationHours = Math.floor(durationMs / 3600000);
      const durationMinutes = Math.floor((durationMs % 3600000) / 60000);
      const durationSeconds = Math.floor((durationMs % 60000) / 1000);
  
      setDutyHours(`${durationHours}h ${durationMinutes}m ${durationSeconds}s`);
    }
  };

  const CurrentdutyHours = ()=>{
    if(timein){
      const now = Date.now();
      const [h,m,s] = timein.split(":").map(Number);
      const timeinDate = new Date();
      timeinDate.setHours(h,m,s,0);
      const timeinMs = timeinDate.getTime();
      const elapsedMs = now - timeinMs;
      return Math.floor(elapsedMs/1000);
    }
    return 0;
  }
  
  const handle_recordDuty = async () => {
    await SecureStore.deleteItemAsync(getInfo)

    if (!employeeID || !timein || !timeout) {
        console.error("Missing data to record duty hours");
        return;
    }

    const reqData = {
        employeeID,
        timein,
        timeout,
        dutyHours,
        currentDate,
    };
    

    try {
        const response = await fetch(`${link.serverLink}/api/recordDuty`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqData),
        });

        const resData = await response.json();
        console.log(resData);
        
        

    } catch (error) {
        console.error("Error recording duty hours:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.stamps}>
        <Text style={styles.dateCss}>Date: {currentDate}</Text>
        <View style={styles.counterCont}>
          <Text>Duty Hour</Text>
          <Counter start={isRunning} initialTime={CurrentdutyHours} interval={1000} step={1} />
        </View>
        <Text style={styles.timeCss}>Time in: {timein ? timein : "--"}</Text>
        <Text style={styles.timeCss}>Time out: {timeout ? getTimeStamp(timeout) : "--"}</Text>
      </View>

      <TouchableOpacity
        disabled={showBTN}
        onPress={handleTimeStamp}
        style={[styles.btn, { backgroundColor: !showBTN ? "#331177" : "grey" }]}
      >
        <Text style={{ color: "white" }}>{btnName}</Text>
      </TouchableOpacity>

      {showBTN && (
        <TouchableOpacity onPress={async () => {
          await handle_recordDuty();
          Alert.alert("Success", "Your duty hours have been recorded successfully!");
          router.replace("tools/duty_logs");
      }} style={styles.submitBtn}>
          <Text style={{ color: "white" }}>Save</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logs} onPress={() => router.navigate("tools/duty_logs")}>
        <Ionicons name="document-text-outline" size={25} color={"white"} />
      </TouchableOpacity>
    </View>
  );
};

export default Time_sheets;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stamps: {
    flex: 0.6,
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 50,
    borderRadius: 10,
    margin: 50,
    marginTop: 100,
    padding: 10,
  },
  submitBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "green",
    width: 100,
    height: 50,
    borderRadius: 10,
    marginTop: 20,
    padding: 10,
  },
  logs: {
    flexDirection: "row",
    position: "absolute",
    backgroundColor: "black",
    padding: 10,
    borderRadius: 10,
    bottom: 50,
    right: 20,
  },
  counterCont: {
    backgroundColor: "#fff",
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    margin: 30,
    borderWidth: 3,
    borderColor: "#331177",
    elevation: 3,
  },
  dateCss: {
    color: "#331177",
    fontSize: 20,
    fontWeight: "bold",
  },
  timeCss: {
    color: "#331177",
    fontSize: 15,
    fontWeight: "500",
  },
});