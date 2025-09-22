import { React } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import Profile from "./profile";
import Project from "./project";
import Task from "./projectTasks";
import Todo_task from "./todo_task";
import Overall_dashboard from "./overall_dashboard";

const ProjectPage = () => {
  return <Project />;
};

const Tasks = ()=>{
  return <Task />;
}

const TodoTasks = () => {
  return <Todo_task />;
};

const ProfilePage = () => {
  return <Profile />;
};

const OverAllDashboard = () => {
  return <Overall_dashboard/>;
}

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
            } else if (route.name === "TodoTasks") {
              iconName = focused ? "clipboard" : "clipboard-outline";
            } else if (route.name === "OverAllDashboard") {
              iconName = focused ? "trophy" : "trophy-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#331177",
          tabBarInactiveTintColor: "gray",

        })}
      >
        <Tab.Screen name="Projects" options={{headerTitle:''}} component={ProjectPage} />
        <Tab.Screen name="OverAllDashboard" options={{headerTitle:'',title:"Ranking"}} component={OverAllDashboard} />
        {/* <Tab.Screen name="Task" options={{headerTitle:''}} component={Tasks} /> */}
        <Tab.Screen name="TodoTasks" options={{headerTitle:'',title:'To-do',}} component={TodoTasks} />
        <Tab.Screen name="Profile" options={{headerTitle:''}} component={ProfilePage} />
      </Tab.Navigator>
    </>
  );
};

export default tabsHandler;
