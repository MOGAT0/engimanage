import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import AdminDashboard from "./adminDashboard";
import ManageRoles from "./manageRoles";
import ProjectManager from "./projectManager";
import UserControl from "./userControl";
import AdminProfile from "./adminProfile";

const Dashboard = () => {
  return <AdminDashboard />;
};

const ManageRole_Page = () =>{
    return <ManageRoles/>;
};

const ProjectManager_Page = ()=>{
    return <ProjectManager/>;
};

const UserControl_Page = ()=>{
    return <UserControl/>;
};

const Profile = ()=>{
    return <AdminProfile/>;
};


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

            else if (route.name === "ProjectManager"){
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
          options={{ headerShown: false, headerTitle: "shit" }}
          component={Dashboard}
        />
        <Tab.Screen
          name="ManageRoles"
          options={{ headerShown: false, headerTitle: "shit" }}
          component={ManageRole_Page}
        />
        <Tab.Screen
          name="ProjectManager"
          options={{ headerShown: false, headerTitle: "shit" }}
          component={ProjectManager_Page}
        />
        <Tab.Screen
          name="UserControl"
          options={{ headerShown: false, headerTitle: "shit" }}
          component={UserControl_Page}
        />
        <Tab.Screen
          name="Profile"
          options={{ headerShown: false, headerTitle: "shit" }}
          component={Profile}
        />

      </Tab.Navigator>
    </>
  );
};

export default adminHandler;

const styles = StyleSheet.create({});
