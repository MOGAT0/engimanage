import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import ProjectPanel from "./project_components/projectPanel";
import Ionicons from "react-native-vector-icons/Ionicons";
import Dialog from "react-native-dialog";
import { router } from "expo-router";
import Br from "./components/spacer";
import * as SecureStore from "expo-secure-store";
import Containers, { Toast } from "toastify-react-native";

import globalScript from "./globals/globalScript";

const link = globalScript;
const API_LINK_create = `${link.api_link}/createproject`;
const API_LINK_join = `${link.api_link}/joinproject`;

const Project = () => {
  const [popUp, setPopup] = useState(false);
  const [createpopUp, setCreatepopup] = useState(false);
  const [joinpopUp, setJoinpopup] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [desc, setDesc] = useState("");
  const [projectManager, setProjectManager] = useState("");

  const [joinPin, setJoinpin] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userPermission, setUserPermission] = useState("");
  const [userID, setUserID] = useState(null);

  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");

  const [projects, setProjects] = useState([]);
  const [currentProjects, setCurrentProjects] = useState([]);
  const [otherproject, setOtherProject] = useState([]);

  const [selectedFilter, setSelectedFilter] = useState("All");
  const FILTERS = ["All", "Joined", "Others"];

  const [selectedProjectID, setSelectedProjectID] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // useEffect(()=>{
  //   Toast.success("Welcome")
  // },[])

  //retrieve user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      console.log("fetch user");

      try {
        const loginDataString = await SecureStore.getItemAsync("loginData");

        if (loginDataString) {
          const loginData = JSON.parse(loginDataString);
          setUserRole(loginData.role);
          setUserID(loginData.ID);
          setPass(loginData.pass);
          setEmail(loginData.email);
          setProjectManager(loginData.fname);
          setUserPermission(loginData.permission_key);
          console.log("employee account:");
          console.log(loginData);
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      }
    };

    fetchUserInfo();
    userProjects();
    getothersproject();
    fetchProjects();

    // display projects ------------------->
    if (projects.length > 0) {
      styles.bootup = { display: "none" };
    } else {
      styles.bootup = { display: "flex" };
    }
  }, [userRole, userID, pass, email, projectManager, userPermission]);

  // update login data ---------------------------------------------------------------->
  const updateLogin = async () => {
    if (email === "" || pass === "") {
      return;
    }

    try {
      const reqData = {
        email: email,
        pass: pass,
      };

      const response = await fetch(`${link.api_link}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(reqData),
      });

      const data = await response.json();
      console.log(`login data:`, data);

      if (response.ok && Object.keys(data).length >= 1) {
        await saveLogin("loginData", data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveLogin = async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
      // console.log("login info saved!");
    } catch (error) {
      console.error(error);
    }
  };

  // display all existing groups ---------------------------------->
  const fetchProjects = async () => {
    try {
      const response = await fetch(`${link.api_link}/getprojects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      console.log(data);

      if (data.ok) {
        setProjects(data.projects);
      } else {
        console.error("Failed to fetch projects.");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // check user current project ------------------------------------------------->
  const userProjects = async () => {
    try {
      const reqBody = {
        ID: userID,
      };

      const response = await fetch(`${link.api_link}/userCurrentProject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();

      setCurrentProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  // get others project ------------------------------------->
  const getothersproject = async () => {
    try {
      const reqBody = {
        ID: userID,
      };

      const response = await fetch(`${link.api_link}/otherprojects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();

      setOtherProject(data);
    } catch (error) {
      console.error(error);
    }
  };

  // request create ---------------------------------->
  const handleCreateProject = async () => {
    if (
      userPermission !== "add_edit_update_delete" &&
      userPermission !== "full"
    ) {
      Alert.alert("Error", "Only project managers are allowed for this action");
      return;
    }

    try {
      const reqData = {
        projectName,
        desc,
        projectManager,
        userID,
      };

      const response = await fetch(API_LINK_create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
      });

      const data = await response.json();

      if (
        response.ok &&
        projectName !== "" &&
        desc !== "" &&
        projectManager !== ""
      ) {
        // Alert.alert("Success","Created Successfully");
        Toast.success("Created Successfully");
        await updateLogin();
        await userProjects();
        await getothersproject();
        await fetchProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPopup(false);
    }
  };

  // request join --------------------------------------->
  const handleJoin = async () => {
    if (!joinPin) {
      Toast.error("Empty field");
      return;
    }

    try {
      const reqData = { pin: joinPin, employeeID: userID };

      const response = await fetch(API_LINK_join, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
      });

      const data = await response.json();

      if (data.ok) {
        Toast.success(data.message);
        updateLogin();
        userProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // project membership verification before opening sang project ----------------->
  const handleProjectClick = async (projectID) => {
    // console.log(projectID);

    try {
      const reqBody = {
        userID,
        projectID,
      };
      const response = await fetch(`${link.api_link}/checkProjectMembers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();

      if (data.length >= 1 || userPermission === "full") {
        router.navigate(
          `/project_components/projectHandler?projectID=${projectID}&homeRoute=tabsHandler`
        );
      } else {
        setSelectedProjectID(projectID);
        setJoinpopup(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const send_request_join = async (projectID, employeeID) => {
    try {
      const reqBody = {
        projectID,
        employeeID,
      };
      const response = await fetch(`${link.api_link}/send_request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();

      if (data.ok) {
        Toast.success("Request Sent");
        setJoinpopup(false);
      } else {
        Toast.error("Request Failed");
        setJoinpopup(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFilteredProjects = () => {
    if (selectedFilter === "Joined") return currentProjects;
    if (selectedFilter === "Others") return otherproject;
    return projects;
  };

  return (
    <View style={styles.container}>
      <Containers position={"top"} duration={1500} style={{ width: "200" }} />

      <Text style={styles.title}>Projects</Text>

      <View style={styles.filterContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonSelected,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextSelected,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text
        style={
          projects.length > 0
            ? { display: "none" }
            : { color: "red", marginTop: 200 }
        }
      >
        {"~No active projects"}
      </Text>

      {/* project panel */}
      <ScrollView
        style={{ width: "100%" }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchProjects();
              await userProjects();
              await getothersproject();
              setRefreshing(false);
            }}
            colors={["#332277"]}
          />
        }
      >
        {getFilteredProjects().map((project) => (
          <ProjectPanel
            isViewer={userPermission === "view"}
            key={project.ID}
            pmanager={project.projectManager.replace(/_/g, " ")}
            pname={project.projectName}
            css={styles.project_panel}
            onClick={() => handleProjectClick(project.ID)}
            txtstyle={{
              fontSize: 20,
              fontWeight: "bold",
              color: "black",
              marginBottom: 10,
            }}
            joined={currentProjects.some((cp) => cp.ID === project.ID)}
            // projectStatus={project.status}
          />
        ))}
      </ScrollView>

      {userPermission !== "view" && (
        <TouchableOpacity
          onPress={() => {
            {
              userPermission === "add_edit_update_delete" ||
              userPermission === "full"
                ? setPopup(true)
                : setJoinpopup(true);
            }
            // setPopup(true);
          }}
          style={styles.createBTN}
        >
          <View>
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "bold" }}>
              {userPermission === "add_edit_update_delete" ||
              userPermission === "full"
                ? "Create/Join"
                : "Join Project"}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <Modal visible={popUp} animationType="slide" transparent={true}>
        <TouchableOpacity
          style={styles.closeBTN}
          onPress={() => {
            setPopup(false);
          }}
        >
          <Ionicons name="close-circle" size={50} color={"red"} />
        </TouchableOpacity>

        <View style={styles.outerBox}>
          <View style={styles.innerBox}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => setCreatepopup(true)}
            >
              <Text style={styles.btnText}>Create</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => setJoinpopup(true)}
            >
              <Text style={styles.btnText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* create popup */}

      <Dialog.Container visible={createpopUp}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Create Project
        </Text>
        {/* <Dialog.Description>Project Name</Dialog.Description> */}
        <Dialog.Input
          value={projectName}
          onChangeText={setProjectName}
          placeholder="Enter project name"
          style={{ color: "black" }}
        />

        {/* <Dialog.Description>Project Description</Dialog.Description> */}
        <Dialog.Input
          value={desc}
          onChangeText={setDesc}
          placeholder="Enter project description"
          style={{ color: "black" }}
        />

        <Dialog.Button label="Cancel" onPress={() => setCreatepopup(false)} />
        <Dialog.Button
          label="Submit"
          onPress={async () => {
            handleCreateProject();
            setProjectName("");
            setDesc("");
            setCreatepopup(false);
          }}
        />
      </Dialog.Container>

      {/*join popup */}

      <Dialog.Container visible={joinpopUp}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Join Project
        </Text>
        <Dialog.Input
          placeholder="Pin"
          onChangeText={setJoinpin}
          style={{ color: "black" }}
        ></Dialog.Input>
        <Dialog.Button label="Cancel" onPress={() => setJoinpopup(false)} />
        <Dialog.Button
          label="Submit"
          onPress={() => {
            handleJoin();
            setJoinpopup(false);
          }}
        />
        {!popUp && (
          <Dialog.Button
            label="Request Join"
            onPress={() => send_request_join(selectedProjectID, userID)}
          />
        )}
      </Dialog.Container>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
    marginTop: 40,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  project_panel: {
    backgroundColor: "#fff",
    borderColor: "#332255",
    borderWidth: 1.5,
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: "95%",
    alignSelf: "center",
  },
  createBTN: {
    position: "absolute",
    top: 40,
    right: 15,
    backgroundColor: "black",
    borderRadius: 5,
    padding: 10,
  },
  outerBox: {
    flex: 1,
    justifyContent: "flex-end",
    alignContent: "center",
  },
  innerBox: {
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    height: 150,
    backgroundColor: "#ccc",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  btn: {
    width: "95%",
    height: "30%",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    margin: 5,
  },
  btnText: {
    fontSize: 20,
  },
  closeBTN: {
    flex: 3.8,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eee",
  },

  filterButtonSelected: {
    backgroundColor: "#332277",
    borderColor: "#ccc",
  },

  filterButtonText: {
    fontSize: 16,
    color: "#333",
  },

  filterButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Project;
