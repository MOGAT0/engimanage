import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { base64ToImageUri } from "../components/ImageBase64";
import globalScript from "../globals/globalScript";

const link = globalScript;

const Sell_supplier = () => {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageUri, setNewImageUri] = useState(null);
  const [newImageBase64, setNewImageBase64] = useState(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageUri, setEditImageUri] = useState(null);
  const [editImageBase64, setEditImageBase64] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const pickImageAndCompress = async (setUri, setBase64) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Allow gallery access to pick an image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (result.canceled) return;

      const pickedUri = result.assets[0].uri;

      const manipulated = await ImageManipulator.manipulateAsync(
        pickedUri,
        [{ resize: { width: 1024 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      setUri(manipulated.uri);
      setBase64(manipulated.base64);
    } catch (err) {
      console.error("Image pick error:", err);
      Alert.alert("Image error", err.message || "Could not pick the image.");
    }
  };

  // SAVE PRODUCT
  const handle_SaveProduct = async () => {
    if (!newName || !newPrice || !newImageBase64) {
      Alert.alert("Error", "Please fill in name, price, and select an image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newName);
      formData.append("price", newPrice);

      if (newImageUri) {
        const filename = newImageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const ext = match ? match[1].toLowerCase() : "jpg";
        const mime = ext === "png" ? "image/png" : "image/jpeg";

        const fileUri =
          Platform.OS === "android" && !newImageUri.startsWith("file://")
            ? newImageUri
            : newImageUri;

        formData.append("image", {
          uri: fileUri,
          name: filename ?? `product.${ext}`,
          type: mime,
        });
      }

      const res = await fetch(`${link.api_link}/add_product`, {
        method: "POST",
        body: formData,
      });

      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const json = await res.json();
        if (!res.ok) {
          console.warn("Upload failed (json):", json);
          throw new Error(json.message || JSON.stringify(json));
        }
        console.log("Server response:", json);
      } else {
        const text = await res.text();
        if (!res.ok) {
          console.warn("Upload failed (text):", text);
          throw new Error(text);
        } else {
          console.log("Received non-json response:", text);
        }
      }

      const newProduct = {
        id: Date.now().toString(),
        name: newName,
        price: newPrice,
        imageUri: newImageUri,
        imageBase64: newImageBase64,
      };
      setProducts((prev) => [...prev, newProduct]);

      setNewName("");
      setNewPrice("");
      setNewImageUri(null);
      setNewImageBase64(null);
      setModalVisible(false);
    } catch (err) {
      console.log("Save product error:", err.message);
      Alert.alert(
        "Upload failed",
        err.message || "An error occurred while uploading."
      );
    }
  };

  //fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${link.api_link}/fetch_product`, {
        method: "POST",
      });

      const json = await response.json();

      if (json.ok) {
        const productsWithFullImageUrl = json.products.map((p) => ({
          ...p,
          fullImageUri: p.image_url ? `${link.serverLink}${p.image_url}` : null,
        }));
        setProducts(productsWithFullImageUrl);
      } else {
        Alert.alert("Error", "Failed to fetch products");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // delete product
  // delete product
  const handle_DeleteProduct = async (id) => {
    try {
      const response = await fetch(`${link.api_link}/delete_product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productID: id }),
      });

      const data = await response.json();

      if (data.ok) {
        Alert.alert("Success", "Deleted Successfully");
        fetchProducts();
        setProducts((prev) => prev.filter((p) => p.ID !== id)); // Match DB column name
      } else {
        Alert.alert("Error", data.message || "Failed to delete");
      }

      setSelectedId(null);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // update product
  const handle_UpdateProduct = async () => {
    if (!editName || !editPrice) {
      Alert.alert("Error", "Please fill in both name and price.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("productID", selectedId);
      formData.append("name", editName);
      formData.append("price", editPrice);

      if (editImageUri) {
        const filename = editImageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const ext = match ? match[1].toLowerCase() : "jpg";
        const mime = ext === "png" ? "image/png" : "image/jpeg";

        const fileUri =
          Platform.OS === "android" && !editImageUri.startsWith("file://")
            ? editImageUri
            : editImageUri;

        formData.append("image", {
          uri: fileUri,
          name: filename ?? `product.${ext}`,
          type: mime,
        });
      }

      const res = await fetch(`${link.api_link}/update_products`, {
        method: "POST",
        body: formData,
        headers: {},
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Update failed");
      }

      Alert.alert("Success", "Product updated successfully");
      fetchProducts();

      setProducts((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? {
                ...item,
                name: editName,
                price: editPrice,
                imageUri: editImageUri,
                imageBase64: null, // wala na ni
              }
            : item
        )
      );

      setEditModalVisible(false);
      setSelectedId(null);
    } catch (err) {
      Alert.alert("Update error", err.message);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedId === item.ID;

    const imageSource = item.fullImageUri
      ? { uri: item.fullImageUri }
      : item.imageUri
      ? { uri: item.imageUri }
      : item.imageBase64
      ? { uri: base64ToImageUri(item.imageBase64) }
      : null;

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => setSelectedId(isSelected ? null : item.ID)}
      >
        <View style={styles.iconPlaceholder}>
          {imageSource ? (
            <Image source={imageSource} style={styles.productImage} />
          ) : (
            <Ionicons name="image-outline" size={50} color="#aaa" />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>₱ {item.price}</Text>
        </View>

        {!isSelected && (
          <Ionicons
            name="create-outline"
            size={22}
            color="#555"
            style={{ marginRight: 8 }}
          />
        )}

        {isSelected && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#007bff" }]}
              onPress={() => {
                setSelectedId(item.ID);
                setEditName(item.name);
                setEditPrice(item.price?.toString() ?? "");
                setEditImageUri(item.imageUri ?? null);
                setEditImageBase64(item.imageBase64 ?? null);
                setEditModalVisible(true);
              }}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#dc3545" }]}
              onPress={() => handle_DeleteProduct(item.ID)}
            >
              <Ionicons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products yet</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Product</Text>

            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() =>
                pickImageAndCompress(setNewImageUri, setNewImageBase64)
              }
            >
              {newImageUri || newImageBase64 ? (
                <Image
                  source={
                    newImageUri
                      ? { uri: newImageUri }
                      : { uri: base64ToImageUri(newImageBase64) }
                  }
                  style={styles.productImage}
                />
              ) : (
                <Ionicons name="add-outline" size={50} />
              )}
            </TouchableOpacity>

            <TextInput
              placeholder="Product Name"
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              placeholder="Price"
              style={styles.input}
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handle_SaveProduct}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: "red", marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Product</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() =>
                pickImageAndCompress(setEditImageUri, setEditImageBase64)
              }
            >
              {editImageUri || editImageBase64 ? (
                <Image
                  source={
                    editImageUri
                      ? { uri: editImageUri }
                      : { uri: base64ToImageUri(editImageBase64) }
                  }
                  style={styles.productImage}
                />
              ) : (
                <Ionicons name="add-outline" size={50} />
              )}
            </TouchableOpacity>

            <TextInput
              placeholder="Product Name"
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              placeholder="Price"
              style={styles.input}
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handle_UpdateProduct}
            >
              <Text style={styles.saveButtonText}>Update</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={{ color: "red", marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: { fontSize: 16, color: "#888" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  title: { fontSize: 20, fontWeight: "bold" },
  addButton: {
    backgroundColor: "#331177",
    borderRadius: 50,
    padding: 5,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  iconPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: "#ddd",
    borderRadius: 8,
    marginRight: 10,
    overflow: "hidden",
  },
  productImage: { width: "100%", height: "100%", resizeMode: "cover" },
  productName: { fontSize: 16, fontWeight: "bold" },
  productPrice: { fontSize: 14, color: "#777" },
  actionButtons: { flexDirection: "row" },
  actionButton: { padding: 6, borderRadius: 5, marginLeft: 5 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#331177",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
  imagePicker: {
    width: 100,
    height: 100,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
});

export default Sell_supplier;
