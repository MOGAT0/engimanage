import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Button,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import DataSecureStorage from "../components/DataSecureStorage";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import link from "../globals/globalScript";
import CustomHeader from "../components/customHeader";

const ManagementPage = ({ projectID, homeRoute }) => {
  
  const [budget, setBudget] = useState(0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isManager, setIsManager] = useState(false);

  const [projectName, setProjectName] = useState("~Project Name");

  const [members, setMembers] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);

  const [teamLeader, setTeamLeader] = useState("~team leader");

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleSelectedMember, setRoleSelectedMember] = useState(null);

  const [pinCode, setPinCode] = useState("");

  const rolesList = [
    "project_manager",
    "finance_dept",
    "staff",
    "supervisor",
    "procurement_officer",
    "HR",
  ];

  // on load function ma run ni sa once mag open ang page ngani
  useEffect(() => {
    updatebudget();
    handleSetDeadline();
    getuserInfo();
    getcurrentprojectmembers();
    getavailablemembers();
    getTeamLeader();
  }, []);

  // assign role to member ------------------------------------------>
  const handleAssignRole = async (memberID, role) => {
    try {
      const response = await fetch(`${link.api_link}/project_assign_role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeID: memberID,
          role,
          projectID: Number(projectID),
        }),
      });

      const data = await response.json();
      console.log(data);

      if (data.ok) {
        getcurrentprojectmembers();
        setShowRoleModal(false);
        setRoleSelectedMember(null);
      } else {
        console.log("Failed to assign role:", data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getuserInfo = async () => {
    const data = await DataSecureStorage.getItem("loginData");
    if (data) {
      const info = JSON.parse(data);
      
      if (info.permission_key === "add_edit_update_delete" || info.permission_key === "full") {
        setIsManager(true);
      }
    }
  };

  const getTeamLeader = async () => {
    if (!projectID) {
      console.log("no project ID");
      return;
    }

    try {
      const response = await fetch(`${link.api_link}/teamleader`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectID }),
      });
      const data = await response.json();

      if (data.ok && data.result.length > 0) {
        console.log(data);

        setTeamLeader(`${data.result[0].fname} ${data.result[0].lname}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getcurrentprojectmembers = async () => {
    if (!projectID) {
      console.log("no project ID");
      return;
    }

    try {
      const response = await fetch(`${link.api_link}/getprojectmembers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectID }),
      });

      const data = await response.json();
      console.log(data);
      
      if (data.ok) {
        setMembers(data.result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getavailablemembers = async () => {
    if (!projectID) {
      console.log("no project ID");
      return;
    }

    try {
      const response = await fetch(`${link.api_link}/getavailablemembers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectID }),
      });

      const data = await response.json();

      if (data.ok && data.result.length > 0) {
        setAvailableMembers(data.result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setDeadline(new Date(formattedDate));
      updateDeadline(formattedDate);
    }
    setShowDatePicker(false);
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(pinCode.toString());
  };

  const toggleSelectMember = (member) => {
    const isSelected = selectedMembers.find((m) => m.fname === member.fname);
    if (isSelected) {
      setSelectedMembers((prev) =>
        prev.filter((m) => m.fname !== member.fname)
      );
    } else {
      setSelectedMembers((prev) => [...prev, member]);
    }
  };

  // add new members --------------------------------------------->
  const handleAddMembers = async () => {
    try {
      const reqBody = {
        members: selectedMembers.map((m) => m.ID),
        projectID: projectID,
      };

      const response = await fetch(`${link.api_link}/addmember`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();

      if (data.ok) {
        getcurrentprojectmembers();
        getavailablemembers();
      }
    } catch (error) {
      console.error(error);
    }
    setSelectedMembers([]);
    setShowMemberModal(false);
  };

  // update ang sa db nga budget ------------------------------------------------->
  const handlebudgetUpdate = async (newbudget) => {
    try {
      const reqBody = {
        projectID,
        value: newbudget,
      };

      const response = await fetch(`${link.api_link}/updatebudget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      const data = await response.json();

      if (data.ok) {
        updatebudget();
      }
    } catch (error) {
      console.error(error);
    }
    setIsEditingBudget(false);
  };

  // set ang sa useState (temp data) ------------------------------------------------->
  const updatebudget = async () => {
    try {
      const response = await fetch(`${link.api_link}/getprojectinfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectID }),
      });

      const data = await response.json();

      if (data.ok) {
        setBudget(data.result[0].budget);
        setProjectName(data.result[0].projectName);
        setPinCode(data.result[0].pin);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // delete member ----------------------------------------------------->
  const deleteMember = async (memberID, projectID) => {
    try {
      const res = await fetch(`${link.api_link}/deletemember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectID: Number(projectID), memberID }),
      });
      const data = await res.json();
      if (data.ok) {
        // Alert.alert("Success", "Member Removed");
        getcurrentprojectmembers();
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // update ang deadline sa db ---------------------------------------------------->
  const updateDeadline = async (newDeadline) => {
    if (!newDeadline) {
      console.log("no date inserted");
      return;
    }

    try {
      const response = await fetch(`${link.api_link}/setdeadline`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ projectID, newDeadline }),
      });

      const data = await response.json();

      if (data.ok) {
        handleSetDeadline();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // set ang sa useState (temp data) ----------------------------------------------->
  const handleSetDeadline = async () => {
    try {
      const response = await fetch(`${link.api_link}/getprojectinfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectID }),
      });

      const data = await response.json();
      if (data.ok) {
        setDeadline(new Date(data.result[0].deadline));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formattedDeadline = deadline.toISOString().split("T")[0];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CustomHeader
          title="Project Management"
          routePath={homeRoute}
          backName="Home"
        />
        <Text style={styles.title}>{projectName}</Text>

        <View style={[styles.card]}>
          <TouchableOpacity
            onPress={copyToClipboard}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text style={styles.sectionTitle}>Pin: {pinCode} </Text>
            <Ionicons name="copy-outline" size={20} />
          </TouchableOpacity>
        </View>

        {/* Budget Section */}
        {/* <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>💲Budget</Text>
          {isManager && !isEditingBudget && (
            <TouchableOpacity onPress={() => setIsEditingBudget(true)}>
              <Ionicons name="create-outline" size={25} color="#2980b9" />
            </TouchableOpacity>
          )}
        </View>

        {isManager && isEditingBudget ? (
          <>
            <TextInput
              keyboardType="numeric"
              style={styles.input}
              value={String(budget)}
              onChangeText={(text) => setBudget(Number(text))}
            />
            <Button title="Save" onPress={() => handlebudgetUpdate(budget)} />
          </>
        ) : (
          <Text style={styles.sectionContent}>${budget.toLocaleString()}</Text>
        )}
      </View> */}

        {/* Deadline Section */}
        {/* <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar" size={24} color="#2c3e50" /> Deadline
          </Text>
          {isManager && (
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Ionicons name="create-outline" size={25} color="#2980b9" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionContent}>{formattedDeadline}</Text>

        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View> */}

        {/* Manager Section (update ni later) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👤 Team Leader</Text>
          <Text style={styles.sectionContent}>
            {teamLeader.replace(/_/g, " ")}
          </Text>
        </View>

        {/* Members Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👥 Team Members</Text>
          {members?.map((member) => (
            <View key={member.ID} style={styles.memberRowAligned}>
              <Image
                source={{
                  uri: member.profile_image
                    ? `${link.serverLink}/${member.profile_image}`
                    : `${link.serverLink}/profile/user.png`,
                }}
                style={styles.memberImage}
              />
              <Text style={styles.memberText}>
                {member.fname.replace(/_/g, " ")}{" "}
                {member.lname.replace(/_/g, " ")}
                {/* {member.projectRole.replace(/_/g, " ")} */}
              </Text>

              {/* for assigning roles */}
              {/* {isManager && (
                <TouchableOpacity
                  onPress={() => {
                    setRoleSelectedMember(member);
                    setShowRoleModal(true);
                  }}
                  style={{ marginRight: 10 }}
                >
                  <Ionicons name="settings-outline" size={22} color="#2980b9" />
                </TouchableOpacity>
              )} */}
              
              {isManager && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Confirm Deletion",
                      `Are you sure you want to remove ${member.fname} ${member.lname}?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => deleteMember(member.ID, projectID),
                        },
                      ]
                    );
                  }}
                  style={styles.trashButton}
                >
                  <Ionicons name="trash-outline" color={"red"} size={25} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {isManager && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowMemberModal(true)}
            >
              <Ionicons
                name="person-add-outline"
                size={20}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.addButtonText}>Add Members</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Member Modal */}
        <Modal visible={showMemberModal} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add Members</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {availableMembers?.map((member) => {
                  const isSelected = selectedMembers.find(
                    (m) => m.ID === member.ID
                  );
                  return (
                    <TouchableOpacity
                      key={member.ID}
                      style={styles.checkboxRow}
                      onPress={() => toggleSelectMember(member)}
                    >
                      <Ionicons
                        name={isSelected ? "checkbox" : "square-outline"}
                        size={24}
                        color={isSelected ? "#4CAF50" : "#2c3e50"}
                      />
                      <Text style={[styles.memberItem, { marginLeft: 10 }]}>
                        {member.fname.replace(/_/g, " ")}{" "}
                        {member.lname.replace(/_/g, " ")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAddMembers}
                >
                  <Text style={styles.buttonText}>Add Selected</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowMemberModal(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Role Assign Modal */}
        <Modal visible={showRoleModal} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                Assign Role to {roleSelectedMember?.fname}{" "}
                {roleSelectedMember?.lname}
              </Text>

              {rolesList.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={styles.checkboxRow}
                  onPress={() =>
                    setRoleSelectedMember((prev) => ({
                      ...prev,
                      tempRole: role,
                    }))
                  }
                >
                  <Ionicons
                    name={
                      roleSelectedMember?.tempRole === role
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={22}
                    color="#2980b9"
                  />
                  <Text style={[styles.memberItem, { marginLeft: 10 }]}>
                    {role.replace(/_/g, " ")}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    if (roleSelectedMember?.tempRole) {
                      handleAssignRole(
                        roleSelectedMember?.ID,
                        roleSelectedMember.tempRole
                      );
                    }
                  }}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowRoleModal(false);
                    setRoleSelectedMember(null);
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default ManagementPage;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    margin: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#34495e",
  },
  sectionContent: {
    fontSize: 16,
    color: "#2c3e50",
    marginLeft: 30,
    marginBottom: 10,
  },
  memberItem: {
    fontSize: 15,
    color: "#34495e",
    marginBottom: 5,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 50,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  calendarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deadlineText: {
    fontSize: 16,
    color: "#2c3e50",
    marginLeft: 10,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    backgroundColor: "#2980b9",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  memberRowAligned: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },

  memberImage: {
    width: 25,
    height: 25,
    borderRadius: 25,
    borderWidth: 1,
    marginRight: 8,
  },

  memberText: {
    flex: 1,
    fontSize: 15,
    color: "#2c3e50",
  },

  trashButton: {
    marginLeft: "auto",
    paddingHorizontal: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "flex-start",
    width: "100%",
    justifyContent: "center",
    alignContent: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  icon: {
    marginRight: 8,
  },
});
