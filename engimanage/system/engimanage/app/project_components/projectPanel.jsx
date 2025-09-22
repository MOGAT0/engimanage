import {
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

const ProjectPanel = ({
  onClick,
  css,
  pname,
  pmanager,
  txtstyle,
  joined,
  projectStatus,
}) => {
  return (
    <TouchableOpacity onPress={onClick} style={styles.panelContainer}>
      <Text style={styles.pnameText}>{pname}</Text>
      <Text style={styles.pmanagerText}>{pmanager}</Text>
      {joined && <Text style={styles.join}>Joined</Text>}
      {projectStatus && (
        <Text
          style={[
            styles.status,
            projectStatus === "active"
              ? styles.activeStatus
              : projectStatus === "pending"
              ? styles.pendingStatus
              : projectStatus === "ongoing"
              ? styles.ongoingStatus
              : styles.defaultStatus,
          ]}
        >
          {projectStatus}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default ProjectPanel;

const styles = StyleSheet.create({
  panelContainer: {
    flexDirection: "column",
    backgroundColor: "#f5f3fa",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#332277",
    borderRadius: 5,
    elevation: 2,
  },
  join: {
    borderWidth: 1,
    backgroundColor: "transparent",
    borderColor: "#28a745",
    position: "absolute",
    right: 20,
    bottom: 29,
    top: 29,
    fontSize: 15,
    height: 21,
    width: 60,
    borderRadius: 50,
    textAlign: "center",
    color: "#28a745",
  },
  txt: {
    marginVertical: 2,
  },
  status: {
    position: "absolute",
    right: 90,
    top: 28,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    textAlign: "center",
    fontWeight: "600",
    color: "#fff",
  },
  activeStatus: {
    backgroundColor: "#28a745", 
  },
  pendingStatus: {
    backgroundColor: "#ffc107", 
  },
  ongoingStatus: {
    backgroundColor: "#007bff", 
  },
  defaultStatus: {
    backgroundColor: "#6c757d",
  },
  pnameText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#332277",
    marginBottom: 4,
  },
  pmanagerText: {
    fontSize: 16,
    color: "#fffff",
  },
});
