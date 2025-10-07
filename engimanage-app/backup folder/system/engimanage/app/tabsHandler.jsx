import { React } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import Profile from "./profile";
import Project from "./project";
import Task from "./projectTasks";

const ProjectPage = () => {
  return <Project />;
};

const Tasks = ()=>{
  return <Task />;
}

const ProfilePage = () => {
  return <Profile />;
};

const Tab = createBottomTabNavigator();

const tabsHandler = () => {

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Profile") {
              iconName = focused ? "person-circle" : "person-circle-outline";
            } else if (route.name === "Projects") {
              iconName = focused ? "library" : "library-outline";
            } else if (route.name === "Task") {
              iconName = focused ? "reader" : "reader-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: true,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#331177",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Projects" options={{headerTitle:''}} component={ProjectPage} />
        <Tab.Screen name="Task" options={{headerTitle:''}} component={Tasks} />
        <Tab.Screen name="Profile" options={{headerTitle:''}} component={ProfilePage} />
      </Tab.Navigator>
    </>
  );
};

export default tabsHandler;
