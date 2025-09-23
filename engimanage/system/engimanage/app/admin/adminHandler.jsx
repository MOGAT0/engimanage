import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import AdminDashboard from "./adminDashboard";
import ManageRoles from "./manageRoles";
import ProjectManagement from "./projectManagement";
import UserControl from "./userControl";
import AdminProfile from "./adminProfile";
import Project from "../project";

const Dashboard = () => {
  return <AdminDashboard />;
};

const ManageRole_Page = () =>{
    return <ManageRoles/>;
};

const ProjectManagement_Page = ()=>{
    return <ProjectManagement/>;
};

const UserControl_Page = ()=>{
    return <UserControl/>;
};

const Profile = ()=>{
    return <AdminProfile/>;
};

const ProjectList = ()=> {
  return <Project/>;
}


const Tab = createBottomTabNavigator();

const adminHandler = () => {
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Dashboard") {
              iconName = focused ? "podium" : "podium-outline";
            } 

            else if (route.name === "UserControl"){
              iconName = focused ? "people" : "people-outline";
            } 

            else if (route.name === "ManageRoles"){
              iconName = focused ? "id-card" : "id-card-outline";
            } 

            else if (route.name === "ProjectManagement"){
              iconName = focused ? "library" : "library-outline";
            }
            
            else if (route.name === "Profile"){
              iconName = focused ? "person-circle" : "person-circle-outline";
            }
            

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#331177",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen
          name="Dashboard"
          options={{ headerShown: false, headerTitle: "" }}
          component={Dashboard}
        />
        <Tab.Screen
          name="ManageRoles"
          options={{ headerShown: false, headerTitle: "",title:"Roles"}}
          component={ManageRole_Page}
        />
        <Tab.Screen
          name="ProjectManagement"
          options={{ headerShown: false, headerTitle: "",title:"Projects" }}
          component={ProjectManagement_Page}
        />
        <Tab.Screen
          name="UserControl"
          options={{ headerShown: false, headerTitle: "",title:"Employees" }}
          component={UserControl_Page}
        />
        <Tab.Screen
          name="Profile"
          options={{ headerShown: false, headerTitle: "" }}
          component={Profile}
        />

      </Tab.Navigator>
    </>
  );
};

export default adminHandler;

const styles = StyleSheet.create({});
