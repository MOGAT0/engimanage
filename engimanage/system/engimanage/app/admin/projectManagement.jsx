import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

// ----- Custom Component -----
const ProjectCard = ({ name, description, members }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.projectName}>{name}</Text>
      <Text style={styles.projectDescription}>{description}</Text>
      <View style={styles.membersContainer}>
        <Ionicons name="person" size={16} color="#555" />
        <Text style={styles.membersText}>{members}</Text>
      </View>
    </View>
  );
};

// ----- Main Page -----
const projectManagement = () => {
  const projects = [
    {
      id: "1",
      name: "Website Redesign",
      description: "Updating the UI/UX for client website.",
      members: 5,
    },
    {
      id: "2",
      name: "Mobile App Development",
      description: "Building a cross-platform project management app.",
      members: 8,
    },
    {
      id: "3",
      name: "Marketing Campaign",
      description: "Launching digital ads for the new product line.",
      members: 3,
    },
    {
      id: "4",
      name: "AI Research",
      description: "Exploring new machine learning techniques.",
      members: 6,
    },
  ];

  const [searchText, setSearchText] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);

  // --- Debounce Search ---
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim() === "") {
        setFilteredProjects(projects);
      } else {
        const filtered = projects.filter((p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredProjects(filtered);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Project Management</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color="#555"
          style={{ marginHorizontal: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#777"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons
              name="close"
              size={20}
              color="#555"
              style={{ marginHorizontal: 8 }}
            />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard
            name={item.name}
            description={item.description}
            members={item.members}
          />
        )}
      />
    </View>
  );
};

export default projectManagement;

// ----- Styles -----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dce9dc",
    borderRadius: 20,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  membersContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  membersText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#555",
  },
});
