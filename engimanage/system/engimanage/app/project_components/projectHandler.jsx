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

const FilePage = () =>{
  return <ProjectFiles/>;
}

const Notification = () => {
  return <Notif/>;
}

const Select = () => {
  return <Select_supplier/>;
}

const AssignedTasks = () => {
  return <ViewAssignedTasks />;
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
        <Tab.Screen name="dashboard" initialParams={{projectID}} component={Projects} options={{headerShown:false,title:"Dashboard"}}/>
        <Tab.Screen name="management" initialParams={{projectID}} component={Management} options={{headerShown:false,title:"Management"}}/>
        <Tab.Screen name="task" initialParams={{projectID}} component={Tasks} options={{headerShown:false,title:"Tasks"}}/>
        {/* <Tab.Screen name="assignedtasks" initialParams={{projectID}} component={AssignedTasks} options={{headerShown:false,title:"Assigned Tasks"}}/> */}
        <Tab.Screen name="projectfiles" initialParams={{projectID}} component={FilePage} options={{headerShown:false,title:"Files"}}/>
        {/* <Tab.Screen name="tools" initialParams={{projectID}} component={Tool} options={{headerShown:false,title:"Tools"}} /> */}
        <Tab.Screen name="notifications" initialParams={{projectID}} component={Notification} options={{headerShown:false,title:"Notification"}} />
      </Tab.Navigator>
    </>
  );
};

export default ProjectHandler;

const styles = StyleSheet.create({});
