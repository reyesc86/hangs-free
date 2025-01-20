import { StyleSheet, Pressable, Text, Platform } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useScale, WeightDataWithMax } from "@/hooks/useScale";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useEffect, useState } from "react";

const initialWeightData: WeightDataWithMax = {
  weight: 0,
  maxWeight: 0,
  unit: "kg",
};

type HandData = {
  left: WeightDataWithMax;
  right: WeightDataWithMax;
};

export default function Settings() {
  const [selectedHand, setSelectedHand] = useState<"left" | "right">("left");
  const [handData, setHandData] = useState<HandData>({
    left: initialWeightData,
    right: initialWeightData,
  });

  const { weightData, reset } = useScale();
  const isIpad = Platform.OS === "ios" && Platform.isPad;

  useEffect(() => {
    if (weightData) {
      setHandData((prev) => ({
        ...prev,
        [selectedHand]: {
          ...weightData,
          maxWeight: Math.max(weightData.weight, prev[selectedHand].maxWeight),
        },
      }));
    }
  }, [weightData, selectedHand]);

  const currentData = handData[selectedHand];

  const handleReset = () => {
    setHandData((prev) => ({
      ...prev,
      [selectedHand]: initialWeightData,
    }));
    reset();
  };

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
      <ThemedView style={styles.segmentContainer}>
        <SegmentedControl
          values={["Left Hand", "Right Hand"]}
          selectedIndex={selectedHand === "left" ? 0 : 1}
          onChange={(index) => setSelectedHand(index === 0 ? "left" : "right")}
          style={styles.segment}
        />
      </ThemedView>
      <ThemedView style={styles.weightContainer}>
        <ThemedText style={isIpad ? styles.weightTextIpad : styles.weightText}>
          {currentData
            ? `${currentData.weight}${currentData.unit}`
            : "No reading"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.weightContainer}>
        <ThemedText style={isIpad ? styles.weightTextIpad : styles.weightText}>
          {currentData
            ? `Max: ${currentData.maxWeight}${currentData.unit}`
            : "No max weight"}
        </ThemedText>
      </ThemedView>

      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? "rgba(0, 122, 255, 0.5)"
              : "rgb(0, 122, 255)",
          },
          styles.resetCycleButton,
        ]}
        onPress={handleReset}
      >
        <Text style={styles.resetCycleText}>Reset</Text>
      </Pressable>

      <ThemedView style={styles.summaryContainer}>
        <ThemedText style={styles.summaryTitle}>Summary max</ThemedText>
        <ThemedView style={styles.summaryRow}>
          <ThemedText style={styles.summaryText}>
            Left: {handData.left.maxWeight}
            {handData.left.unit}
          </ThemedText>
          <ThemedText style={styles.summaryText}>
            Right: {handData.right.maxWeight}
            {handData.right.unit}
          </ThemedText>
        </ThemedView>
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
  segmentContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  segment: {
    marginBottom: 10,
  },
  weightContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  weightText: {
    fontSize: 40,
    lineHeight: 40,
    fontWeight: "bold",
  },
  weightTextIpad: {
    fontSize: 72,
    lineHeight: 72,
    fontWeight: "bold",
  },
  resetCycleButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 5,
    margin: 20,
  },
  resetCycleText: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 24,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 32,
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 20,
  },
  summaryText: {
    fontSize: 24,
    lineHeight: 24,
  },
});
