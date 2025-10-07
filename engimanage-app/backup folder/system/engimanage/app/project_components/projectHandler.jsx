import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams } from "expo-router";

import DashboardPage from "./projectPage";
import ManagementPage from "./managementPage";
import Task from "./task";
import Tools from "../Tools";
import Select_supplier from "../tools/select_supplier";

const Projects = ({route}) => {
  const {projectID} = route.params;
  return <DashboardPage projectID={projectID} />;
};

const Management = ({route}) => {
  const {projectID} = route.params;
  return <ManagementPage projectID={projectID}/>;
};

const Tasks = ({route})=>{
  const {projectID} = route.params;
    return <Task projectID={projectID}/>;
}

const Tool = ({route})=>{
  const {projectID} = route.params;
    return <Tools projectID={projectID} />;
}

const Select = () => {
  return <Select_supplier/>;
}

const Tab = createBottomTabNavigator();

const ProjectHandler = () => {
  const { initialTab,projectID } = useLocalSearchParams(); 


  return (
    <>
      <Tab.Navigator
        initialRouteName={initialTab || "dashboard"}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "dashboard") {
              iconName = focused ? "podium" : "podium-outline";
            } else if (route.name === "management") {
              iconName = focused ? "briefcase" : "briefcase-outline";
            } else if (route.name === "task") {
              iconName = focused ? "reader" : "reader-outline";
            } else if (route.name === "tools") {
              iconName = focused ? "construct" : "construct-outline";
            } 
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: true,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#331177",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="dashboard" initialParams={{projectID}} component={Projects} options={{headerShown:false}}/>
        <Tab.Screen name="management" initialParams={{projectID}} component={Management} options={{headerShown:false}}/>
        <Tab.Screen name="task" initialParams={{projectID}} component={Tasks} options={{headerShown:false}}/>
        <Tab.Screen name="tools" initialParams={{projectID}} component={Tool} options={{headerShown:false}} />
      </Tab.Navigator>
    </>
  );
};

export default ProjectHandler;

const styles = StyleSheet.create({});
