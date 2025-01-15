import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { BleManager } from "react-native-ble-plx";
import { Buffer } from "buffer";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function SettingsScreen() {
  const { weightData, subscribeToWeightData } = useScale();

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

// LOGIC
interface WeightData {
  weight: number;
  unit: "kg" | "lb";
}

const bleManager = new BleManager();

const useScale = () => {
  const [weightData, setWeightData] = useState<WeightData | null>(null);

  const subscribeToWeightData = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        return;
      }

      const manufacturerData = device?.manufacturerData;
      if (manufacturerData && device?.name?.includes("IF_B7")) {
        try {
          const data = Array.from(Buffer.from(manufacturerData, "base64"));

          console.log("=== Weight Calculation ===");
          console.log(`Byte 12: ${data[12]}`);
          console.log(`Byte 13: ${data[13]}`);

          // Convert two bytes to a 16-bit integer (big-endian)
          const weight = (data[12] * 256 + data[13]) / 100;
          const isStable = data[16] === 1; // From STABLE_OFFSET in iOS code

          console.log(
            `Result: ${weight}${isStable ? " (stable)" : " (unstable)"}`
          );
          console.log("Full data:", data);
          console.log("========================");

          setWeightData({ weight, unit: "kg" }); // iOS code doesn't show unit checking
        } catch (e) {
          console.log("Error parsing data:", e);
        }
      }
    });

  return { weightData, subscribeToWeightData };
};
