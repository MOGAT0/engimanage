import React, { useEffect, useRef, useState } from 'react';
import { Stack } from "expo-router";
import { View, AppState } from 'react-native';
import DataSecureStorage from './components/DataSecureStorage';

import globalScript from './globals/randomPin';

const RootLayout = () => {
  const appState = useRef(AppState.currentState);
  const [isAppActive, setIsAppActive] = useState(true);

  const link = globalScript;

  const updateUserStatus = async (status) => {
    
    try {
      const userData = await DataSecureStorage.getItem('loginData');

      if (!userData) {
        console.warn('No user data found in secure storage.');
        return;
      }

      const parsedData = JSON.parse(userData);

      const response = await fetch(`${link.api_link}/updateUserStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: parsedData.ID,
          status,
        }),
      });

      const resdata = await response.json();
      console.log('Status update response:', resdata);

    } catch (error) {
      console.log('Failed to update user status:', error);
    }
  };


  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        setIsAppActive(true);
        updateUserStatus('active');
      } else if (nextAppState === 'inactive' || nextAppState === 'background') {
        setIsAppActive(false);
        updateUserStatus('inactive');
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);


  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown:false}}/>

      <Stack.Screen name="signin/login" options={{headerShown:false,title:'Login',headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name="signin/register" options={{headerShown:false,title:'Register',headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name="signin/forgotpass" options={{headerShown:false,title:'Forgot Password',headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name="tabsHandler" options={{headerShown:false}}/>

      <Stack.Screen name="tools/purchase_orders" options={{headerShown:true, title:'Purchase Orders', headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name="tools/expense_claims" options={{headerShown:true, title:'Expense Claims', headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name="tools/time_sheets" options={{headerShown:true, title:'Time Sheets', headerBackButtonDisplayMode:"minimal"}}/>
      
      <Stack.Screen name="tools/packing_slips" options={{headerShown:true, title:'Packing Slips', headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name="tools/leave_request" options={{headerShown:true, title:'Leave Request', headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name="tools/yard_booking" options={{headerShown:true, title:'Yard Booking', headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name="tools/duty_logs" options={{headerShown:true, title:'Duty Logs', headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name='tools/select_supplier' options={{headerShown: true, title:'', headerBackButtonDisplayMode:"minimal"}}/>


      <Stack.Screen name="project_components/projectPage" options={{headerShown:true, title:'', headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name="expense_claims/PaymentPage" options={{headerShown:true, title:'', headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name="project_components/projectHandler" options={{headerShown:true, title:'', headerBackButtonDisplayMode:"minimal"}}/>
      <Stack.Screen name="project_components/task" options={{headerShown:true, title:'', headerBackButtonDisplayMode:"minimal"}}/>

      <Stack.Screen name="notif" options={{headerShown:true, title:'Notifications', headerBackButtonDisplayMode:"minimal"}}/>
      
      <Stack.Screen name="supplierHandler" options={{headerShown:false}}/>
      <Stack.Screen name="signin/loginAs" options={{headerShown:false}}/>
      <Stack.Screen name="signin/supplierLogin" options={{headerShown:false}}/>

    </Stack>
  );
}
export default RootLayout;
