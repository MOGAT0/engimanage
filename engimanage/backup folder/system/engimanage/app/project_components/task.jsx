import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import DataSecureStorage from '../components/DataSecureStorage';
import Ionicons from "react-native-vector-icons/Ionicons";

import globalScript from '../globals/globalScript';

const link = globalScript

const Task = ({projectID}) => {
  const [userInfo, setUserinfo] = useState(null);
  const [TASKS, setTask] = useState(null);
  const [taskProgress, setTaskProgress] = useState({});
  const [tempProgress, setTempProgress] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  useEffect(() => {
    handleGetTasks();
    getUserInfo();

    const timer = setTimeout(()=>{
      setLoadingTimeout(true)
    },5000)

    return ()=> clearTimeout(timer)

  }, []);

  console.log(projectID);
  


  const getUserInfo = async ()=>{
    const data = await DataSecureStorage.getItem('loginData');
    if(data){
      const info = JSON.parse(data);
      setUserinfo(info)
    }
  }

  const handleGetTasks = async () => {
    try {
      const reqBody = {
        projectID
      }
      const response = await fetch(`${link.api_link}/getTasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();

      
      
      if (data.ok && data.result.length > 0) {

        console.log("true");
        
        setTask(data.result);
      
        const initial = data.result.reduce((acc, task) => {
          acc[task.ID] = task.progress || 0;
          return acc;
        }, {});
      
        setTaskProgress(initial);
        setTempProgress(initial);
      }else{
        setTask(null)
        console.log("false");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onSlide = (id, value) => {
    setTempProgress((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const onSlideComplete = (id, value) => {
    const snappedValue = Math.round(value / 5) * 5;
    updateProgress(id, snappedValue);
    updateTasks(id, snappedValue);
  };

  const updateProgress = (id, value) => {
    const clamped = Math.max(0, Math.min(100, value));
    setTaskProgress((prev) => ({ ...prev, [id]: clamped }));
    setTempProgress((prev) => ({ ...prev, [id]: clamped }));
  };

  // Muni ang ga update sa db
  const updateTasks = async (id, progress) => {
    
    if(!id){
      alert("Missing Data")
      return;
    }
    try {
      const reqBody = {
        id,
        progress
      }

      const response = await fetch(`${link.api_link}/updateTask`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify(reqBody)
      })

      const data = await response.json();

    } catch (error) {
      console.error(error);
      
    }
  };

  const pressTimeouts = useRef({});
  const handleButtonPress = (id, delta) => {
    if (pressTimeouts.current[id]) {
      clearTimeout(pressTimeouts.current[id]);
    }
    const newValue = Math.round((tempProgress[id] || 0) + delta);
    updateProgress(id, newValue);
    pressTimeouts.current[id] = setTimeout(() => {
      updateTasks(id, newValue);
      delete pressTimeouts.current[id];
    }, 500);
  };

  const handleCreateTask = async ()=>{
    if(!newTaskLabel){
      alert("Missing task label")
      return;
    }

    try {
      const reqBody = {
        projectID : projectID,
        label : newTaskLabel
      }

      const response = await fetch(`${link.api_link}/createTask`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body : JSON.stringify(reqBody)
      })

      console.log(reqBody);
      
      const data = await response.json();
      console.log(data);

      if(data.ok){
        handleGetTasks();
      }

    } catch (error) {
      
    }
  }


  const confirm = (title, message) => {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
          { text: 'Yes', onPress: () => resolve(true) },
        ],
        { cancelable: false }
      );
    });
  };

  const handleDeteleTask = async (ID)=>{

    let conf = await confirm("Delete Task","Are you sure you want to delete this task?")

    if(!conf){
      return
    }

    try {
      const reqBody = {
        ID,
      }

      const response = await fetch(`${link.api_link}/deleteTask`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body : JSON.stringify(reqBody)
      })

      const data = await response.json();

      if(data.ok){
        handleGetTasks();
      }


    } catch (error) {
      console.error(error);
      
    }
  }

  const totalProgress =
    Object.values(taskProgress).reduce((sum, val) => sum + val, 0) /
    (TASKS?.length * 100);

  // muni danay e display kung wala pa unod ang task or samtang ga fetching pa sang data
  return (
    <View style={styles.container}>
      {TASKS === null? (
        <View style={styles.container}>
          <Text style={styles.title}>Task Progress</Text>
          {loadingTimeout? (
            <>
              {userInfo?.role === 'project_manager' && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={()=>setShowModal(true)}
                >
                  <Text style={styles.addButtonText}>+ Add Task</Text>
                </TouchableOpacity>
              )}
              <Text style={{color:"red"}}>No Current Task</Text>
            </>
          ):(
            <>
              <Text style={styles.loadingText}>Loading tasks...</Text>
              <ActivityIndicator size="large" color="#4CAF50" />
            </>
          )}
        </View>
      ):(
        <>
          <Text style={styles.title}>Task Progress</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {Math.round(totalProgress * 100)}% Complete
            </Text>
            <ProgressBar
              progress={totalProgress}
              color="#4CAF50"
              style={styles.progressBar}
            />
          </View>

          {userInfo?.role === 'project_manager' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={()=>setShowModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Task</Text>
            </TouchableOpacity>
          )}


          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {TASKS.map((task) => (
              <View style={styles.item} key={task.ID}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{task.label}</Text>
                  <Text style={styles.sliderLabel}>
                    {Math.round(tempProgress[task.ID])}%
                  </Text>

                  <View style={styles.sliderRow}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleButtonPress(task.ID, -1)}
                    >
                      <Text style={styles.buttonText}>-</Text>
                    </TouchableOpacity>

                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={100}
                      step={1}
                      value={taskProgress[task.ID]}
                      onValueChange={(value) => onSlide(task.ID, value)}
                      onSlidingComplete={(value) =>
                        onSlideComplete(task.ID, value)
                      }
                      minimumTrackTintColor="#4CAF50"
                      maximumTrackTintColor="#ccc"
                      thumbTintColor="#4CAF50"
                      disabled={false}
                    />

                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleButtonPress(task.ID, 1)}
                    >
                      <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                    {userInfo?.role === 'project_manager' && (
                      <TouchableOpacity onPress={() => handleDeteleTask(task.ID)}>
                        <Ionicons name="trash-outline" size={30} color="#e53935" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create a New Task</Text>

            <TextInput
              placeholder="Enter task label"
              style={styles.input}
              value={newTaskLabel}
              onChangeText={setNewTaskLabel}
            />

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                handleCreateTask();
                setNewTaskLabel('');
                setShowModal(false);
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setNewTaskLabel('');
                setShowModal(false);
              }}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Task;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  scrollArea: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  label: {
    fontSize: 18,
  },
  checked: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  slider: {
    flex: 1,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#4CAF50',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});
