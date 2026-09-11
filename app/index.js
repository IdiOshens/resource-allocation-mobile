import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  // NEW: Progress animation - using scaleX instead of width
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 8,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      // NEW: Progress bar animation - this works with native driver
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <View style={styles.logoIcon}>
              <Text style={styles.iconText}>R</Text>
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoMain}>RAS</Text>
              <Text style={styles.logoSub}>Resource Allocation System</Text>
            </View>
          </View>
        </View>

        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Vocational School Management</Text>
          <View style={styles.taglineLine} />
        </View>

        <View style={styles.loadingContainer}>
          {/* NEW: Using scaleX instead of width */}
          <Animated.View
            style={[
              styles.loadingProgress,
              {
                transform: [{ scaleX: progressAnim }],
              },
            ]}
          />
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
        <Text style={styles.footerText}>© 2025 RAS. All rights reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  logoTextContainer: {
    alignItems: "flex-start",
  },
  logoMain: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4A90E2",
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: 10,
    color: "#666666",
    letterSpacing: 1,
    marginTop: 2,
  },
  taglineContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  tagline: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    letterSpacing: 1,
    marginBottom: 8,
  },
  taglineLine: {
    width: 60,
    height: 2,
    backgroundColor: "#FFFFFF",
    opacity: 0.5,
    borderRadius: 2,
  },
  loadingContainer: {
    width: width * 0.5,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  loadingProgress: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    // Start from 0 and scale to full width
    transform: [{ scaleX: 0 }],
  },
  footer: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
  footerText: {
    color: "#FFFFFF",
    opacity: 0.6,
    fontSize: 12,
    marginTop: 2,
  },
});
