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
import ProjectFiles from "./projectFiles";
import ViewAssignedTasks from "./viewAssignedTasks";
import Notif from "../notif";

const Projects = ({route}) => {
  const {projectID, homeRoute} = route.params;
  return <DashboardPage projectID={projectID} homeRoute={homeRoute} />;
};

const Management = ({route}) => {
  const {projectID,homeRoute} = route.params;
  return <ManagementPage projectID={projectID} homeRoute={homeRoute}/>;
};

const Tasks = ({route})=>{
  const {projectID,homeRoute} = route.params;
    return <Task projectID={projectID} homeRoute={homeRoute}/>;
}

const Tool = ({route})=>{
  const {projectID,homeRoute} = route.params;
    return <Tools projectID={projectID} homeRoute={homeRoute}/>;
}

const FilePage = ({route}) =>{
  const {projectID,homeRoute} = route.params;
  return <ProjectFiles projectID={projectID} homeRoute={homeRoute}/>;
}

const Notification = ({route}) => {
  const {projectID,homeRoute,userType} = route.params;
  return <Notif projectID={projectID} homeRoute={homeRoute}/>;
}

const Select = ({route}) => {
  const {projectID,homeRoute} = route.params;
  return <Select_supplier/>;
}

const AssignedTasks = ({route}) => {
  const {projectID,homeRoute} = route.params;
  return <ViewAssignedTasks />;
}


const Tab = createBottomTabNavigator();

const ProjectHandler = () => {
  const { initialTab,projectID,homeRoute } = useLocalSearchParams(); 


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
            } else if (route.name === "projectfiles"){
              iconName = focused ? "folder" : "folder-outline";
            } else if (route.name === "tools") {
              iconName = focused ? "construct" : "construct-outline";
            } else if (route.name === "assignedtasks") {
              iconName = focused ? "bookmark" : "bookmark-outline";
            } else if (route.name === "notifications") {
              iconName = focused ? "notifications" : "notifications-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#331177",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="dashboard" initialParams={{projectID,homeRoute}} component={Projects} options={{headerShown:false,title:"Dashboard"}}/>
        <Tab.Screen name="management" initialParams={{projectID,homeRoute}} component={Management} options={{headerShown:false,title:"Management"}}/>
        <Tab.Screen name="task" initialParams={{projectID,homeRoute}} component={Tasks} options={{headerShown:false,title:"Tasks"}}/>
        {/* <Tab.Screen name="assignedtasks" initialParams={{projectID}} component={AssignedTasks} options={{headerShown:false,title:"Assigned Tasks"}}/> */}
        <Tab.Screen name="projectfiles" initialParams={{projectID,homeRoute}} component={FilePage} options={{headerShown:false,title:"Files"}}/>
        {/* <Tab.Screen name="tools" initialParams={{projectID}} component={Tool} options={{headerShown:false,title:"Tools"}} /> */}
        <Tab.Screen name="notifications" initialParams={{projectID,homeRoute,userType}} component={Notification} options={{headerShown:false,title:"Notification"}} />
      </Tab.Navigator>
    </>
  );
};

export default ProjectHandler;

const styles = StyleSheet.create({});
