import { StyleSheet } from "react-native";
import { useEffect } from "react";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useScale } from "@/hooks/useScale";

export default function SettingsScreen() {
  const { bleManager, weightData, subscribeToWeightData } = useScale();

  useEffect(() => {
    subscribeToWeightData();

    return () => {
      bleManager.stopDeviceScan();
    };
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={210}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">SICK DUDE</ThemedText>
      </ThemedView>
      <ThemedView style={styles.weightContainer}>
        <ThemedText style={styles.weightText}>
          {weightData ? `${weightData.weight}${weightData.unit}` : "No reading"}
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -70,
    left: -5,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  weightContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 20,
    minHeight: 100,
  },
  weightText: {
    fontSize: 48,
    lineHeight: 48,
    fontWeight: "bold",
  },
});
