import { React } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import Dashboard from './partneredPage/dashboard_supplier';
import Sell from './partneredPage/sell_supplier';
import Received from './partneredPage/received_supplier';
import Profile from "./partneredPage/profile_supplier";

const DashboardPage = ()=>{
  return <Dashboard/>;
}

const ReceivedPage = ()=>{
  return <Received/>;
}

const SellPage = () =>{
  return <Sell/>
}

const ProfilePage = () => {
  return <Profile/>;
}
const Tab = createBottomTabNavigator();

const SupplierHandler = () => {
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon : ({ focused, color, size }) => {
            let iconName;

            if(route.name === "Dashboard"){
              iconName = focused ? 'podium' : 'podium-outline';
            }else if (route.name === "Sell"){
              iconName = focused ? 'bag-add' : 'bag-add-outline';
            }else if (route.name === 'Received'){
               iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
            }else if (route.name === 'Profile'){
               iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color}/>
          },
          headerShown: true,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#331177",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name='Dashboard' options={{headerTitle:'',headerShown:true}} component={DashboardPage}/>
        <Tab.Screen name='Sell' options={{headerTitle:'',headerShown:true}} component={SellPage}/>
        <Tab.Screen name='Received' options={{headerTitle:'',headerShown:true}} component={ReceivedPage}/>
        <Tab.Screen name='Profile' options={{headerTitle:'',headerShown:true}} component={ProfilePage}/>


      </Tab.Navigator>
    </>
  )
}
export default SupplierHandler