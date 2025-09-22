import React, { useEffect, useRef, useState } from "react";
import { Stack } from "expo-router";
import { View, AppState } from "react-native";
import DataSecureStorage from "./components/DataSecureStorage";

import globalScript from "./globals/randomPin";

const RootLayout = () => {
  const appState = useRef(AppState.currentState);
  const [isAppActive, setIsAppActive] = useState(true);

  const link = globalScript;

  const updateUserStatus = async (user_status) => {
    try {
      console.log(`current status:${user_status}`);
      const userData = await DataSecureStorage.getItem("loginData");

      if (!userData) {
        console.warn("No user data found in secure storage.");
        return;
      }

      const parsedData = JSON.parse(userData);
      
      console.log(JSON.stringify({
          userID: parsedData.ID,
          status: user_status,
      }));
      

      const response = await fetch(`${link.api_link}/updateUserStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: parsedData.ID,
          status: user_status,
        }),
      });


      const resdata = await response.json();

      console.log("Status update response:", resdata);
    } catch (error) {
      console.log("Failed to update user status:", error);
    }
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log(nextAppState);
      if (nextAppState === "active") {
        setIsAppActive(true);
        updateUserStatus("active");
      } else if (nextAppState === "background") {
        setIsAppActive(false);
        updateUserStatus("inactive");
      } else if (nextAppState === "inactive") {
        console.log("App is transitioning (inactive)");
        updateUserStatus("inactive");
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  },[]);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, statusBarHidden: true }}
      />

      <Stack.Screen name="tabsHandler" options={{ headerShown: false }} />
      <Stack.Screen
        name="signin/login"
        options={{
          headerShown: false,
          title: "Login",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="signin/adminLogin"
        options={{
          headerShown: false,
          title: "Admin",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="signin/register"
        options={{
          headerShown: false,
          title: "Register",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="signin/forgotpass"
        options={{
          headerShown: false,
          title: "Forgot Password",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="todo_task"
        options={{
          headerShown: false,
          title: "Todo Task",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />

      <Stack.Screen
        name="tools/purchase_orders"
        options={{
          headerShown: true,
          title: "Purchase Orders",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="tools/expense_claims"
        options={{
          headerShown: true,
          title: "Expense Claims",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="tools/time_sheets"
        options={{
          headerShown: true,
          title: "Time Sheets",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />

      <Stack.Screen
        name="tools/packing_slips"
        options={{
          headerShown: true,
          title: "Packing Slips",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="tools/leave_request"
        options={{
          headerShown: true,
          title: "Leave Request",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="tools/yard_booking"
        options={{
          headerShown: true,
          title: "Yard Booking",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="tools/duty_logs"
        options={{
          headerShown: true,
          title: "Duty Logs",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="tools/select_supplier"
        options={{
          headerShown: true,
          title: "",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />

      <Stack.Screen
        name="project_components/projectPage"
        options={{
          headerShown: false,
          title: "",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="project_components/projectHandler"
        options={{
          headerShown: false,
          title: "",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="project_components/task"
        options={{
          headerShown: false,
          title: "",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />

      <Stack.Screen
        name="expense_claims/PaymentPage"
        options={{
          headerShown: false,
          title: "",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="notif"
        options={{
          headerShown: false,
          title: "Notifications",
          headerBackButtonDisplayMode: "minimal",
          statusBarHidden: true,
        }}
      />

      <Stack.Screen name="supplierHandler" options={{ headerShown: false }} />
      <Stack.Screen name="signin/loginAs" options={{ headerShown: false }} />
      <Stack.Screen name="signin/supplierLogin" options={{ headerShown: false }} />
      <Stack.Screen
        name="project_components/filePage" options={{ headerShown: false, title: "" }} />

      <Stack.Screen name="project_components/taskView" options={{ headerShown: false, title: "" }} />
      <Stack.Screen name="project_components/taskComments" options={{ headerShown: false, title: "" }} />

      <Stack.Screen name="admin/adminHandler" options={{ headerShown: false, title: "" }} />


      
    </Stack>
  );
};
export default RootLayout;
