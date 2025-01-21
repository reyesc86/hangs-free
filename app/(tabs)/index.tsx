import { Image, StyleSheet, Platform } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<Image style={styles.reactLogo} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">
            Step 1: View Current Weight (force)
          </ThemedText>
          <ThemedText>
            Check the current weight displayed on the screen. The app will
            continuously update the weight in real-time when your crane scale
            device is on.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 2: Measure Max force</ThemedText>
          <ThemedText>
            Use the app to measure your maximum force. It will remember the
            highest value from your try. We don't support saving results for
            now, so make sure you note them down somewhere.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 3: Analyze Recent Cycle</ThemedText>
          <ThemedText>
            View the recent cycle graph to analyze your weight (force) changes
            over time. The graph provides a visual representation of your weight
            data points. When there is no data yet, the graph shows example data
            points.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 24,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
