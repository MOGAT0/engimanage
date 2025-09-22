// wala na ni (5/10/2025)

import { StyleSheet, Text, View } from "react-native";
import React from "react";

const ProjectTabs = ({ projectManager, projectName,textCss }) => {
  return (
    <View>
      <Text style={[textCss,styles.txt]}>{projectName}</Text>
      <Text style={styles.txt}>{projectManager}</Text>
    </View>
  );
};

export default ProjectTabs;

const styles = StyleSheet.create({
  txt:{
    margin:3,
  }
});
