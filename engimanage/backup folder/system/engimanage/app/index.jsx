import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";

import globalScript from './globals/globalScript';

const link = globalScript

const { width, height } = Dimensions.get("screen");

const LandingPage = () => {
  useEffect(() => {
    router.canGoBack();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={{uri:`${link.serverLink}/assets/main.png`}}
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Let’s get you started</Text>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => router.push("./signin/loginAs")}
      >
        {/* /tabsHandler ./signin/login */}
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: width * 0.75,
    height: height * 0.28,
    resizeMode: "contain",
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 50,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#222",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: Platform.OS === "android" ? 3 : 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default LandingPage;
