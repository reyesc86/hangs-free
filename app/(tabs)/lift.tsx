import { StyleSheet, Pressable, Text, Platform } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useScale, WeightDataPoint, WeightDataWithMax } from "@/hooks/useScale";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useEffect, useState } from "react";
import { LineGraph } from "react-native-graph";
import { useColorScheme } from "@/hooks/useColorScheme";

const initialWeightData: WeightDataWithMax = {
  weight: 0,
  maxWeight: 0,
  unit: "kg",
};

type HandData = {
  left: WeightDataWithMax;
  right: WeightDataWithMax;
};

type CycleData = { left: WeightDataPoint[]; right: WeightDataPoint[] };

const now = Date.now();
const nowPlus1 = now + 1000;
const nowPlus2 = now + 2000;
const nowPlus3 = now + 3000;
const nowPlus4 = now + 4000;

const initialCycleHandData = [
  { weight: 0, timestamp: now },
  { weight: 5, timestamp: nowPlus1 },
  { weight: 10, timestamp: nowPlus2 },
  { weight: 5, timestamp: nowPlus3 },
  { weight: 0, timestamp: nowPlus4 },
];

const initialCycleData: CycleData = {
  left: initialCycleHandData,
  right: initialCycleHandData,
};

export default function Settings() {
  const colorScheme = useColorScheme() ?? "light";
  const isLight = colorScheme === "light";
  const [selectedHand, setSelectedHand] = useState<"left" | "right">("left");
  const [handData, setHandData] = useState<HandData>({
    left: initialWeightData,
    right: initialWeightData,
  });

  const [cycleStarted, setCycleStarted] = useState(false);
  const [cycleData, setCycleData] = useState<CycleData>(initialCycleData);
  const [currentPoint, setCurrentPoint] = useState<WeightDataPoint | null>(
    initialCycleData.left[0]
  );
  // const maxPoint = useMemo(
  //   () =>
  //     cycleData.reduce(
  //       (prev, current) => (prev.weight > current.weight ? prev : current),
  //       { weight: 0, timestamp: 0 }
  //     ),
  //   [cycleData]
  // );

  // useEffect(() => {
  //   console.log("Cycle Data:", JSON.stringify(cycleData, null, 2));
  // }, [cycleData]);

  const { weightData, weightDataPoints, reset } = useScale();

  useEffect(() => {
    if (weightData && weightDataPoints.length > 0) {
      const currentWeight = weightData.weight;
      const latestPoint = weightDataPoints[weightDataPoints.length - 1];

      // Detect cycle start (transition from 0 to some weight)
      if (!cycleStarted && currentWeight > 1) {
        setCycleStarted(true);
        // Record cycle start with timestamp
        setCycleData((prev) => ({
          ...prev,
          [selectedHand]: [{ weight: 0, timestamp: latestPoint.timestamp }],
        }));
      }

      // During cycle, record points
      if (cycleStarted) {
        setCycleData((prev) => ({
          ...prev,
          [selectedHand]: [...prev[selectedHand], latestPoint],
        }));
      }

      // Detect cycle end (return to 0 after having some weight)
      if (cycleStarted && currentWeight < 1) {
        setCycleStarted(false);
        // Record cycle end with timestamp
        setCycleData((prev) => ({
          ...prev,
          [selectedHand]: [
            ...prev[selectedHand],
            { weight: 0, timestamp: latestPoint.timestamp },
          ],
        }));
      }

      setHandData((prev) => ({
        ...prev,
        [selectedHand]: {
          ...weightData,
          maxWeight: Math.max(weightData.weight, prev[selectedHand].maxWeight),
        },
      }));
    }
  }, [weightData, weightDataPoints, selectedHand]);

  const currentData = handData[selectedHand];

  const handleResetHand = () => {
    setHandData((prev) => ({
      ...prev,
      [selectedHand]: initialWeightData,
    }));
    setCycleStarted(false);
    setCycleData((prev) => ({
      ...prev,
      [selectedHand]: initialCycleHandData,
    }));
    reset();
  };

  const handleResetAll = () => {
    setHandData({
      left: initialWeightData,
      right: initialWeightData,
    });
    setCycleStarted(false);
    setCycleData(initialCycleData);
    reset();
  };

  const isIpad = Platform.OS === "ios" && Platform.isPad;

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

      <ThemedView style={{ alignItems: "center" }}>
        {cycleData[selectedHand].length > 0 && currentPoint && (
          <ThemedText>
            {currentPoint.weight}
            {currentData.unit} at{" "}
            {new Date(currentPoint.timestamp).toLocaleString("pl-PL", {
              fractionalSecondDigits: 3,
            })}
          </ThemedText>
        )}
        {cycleData[selectedHand].length >= 2 && (
          <LineGraph
            points={cycleData[selectedHand].map((point) => ({
              value: point.weight,
              date: new Date(point.timestamp),
            }))}
            animated
            enablePanGesture
            enableIndicator
            panGestureDelay={0}
            onPointSelected={(point) =>
              setCurrentPoint({
                weight: point.value,
                timestamp: point.date.getTime(),
              })
            }
            // TopAxisLabel={() => <ThemedText>{maxPoint.weight}</ThemedText>}
            // BottomAxisLabel={() => <ThemedText>0</ThemedText>}
            color={isLight ? "#000000" : "#FFFFFF"}
            verticalPadding={12}
            horizontalPadding={12}
            enableFadeInMask
            style={{
              alignSelf: "center",
              width: "100%",
              height: isIpad ? 360 : 200,
              // aspectRatio: 1.4,
              // margin: 8,
            }}
          />
        )}
      </ThemedView>

      <ThemedView style={styles.resetCycleContainer}>
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? "rgba(0, 122, 255, 0.3)"
                : "rgba(0, 122, 255, 0.6)",
            },
            styles.resetCycleButton,
          ]}
          onPress={handleResetHand}
        >
          <Text style={styles.resetCycleText}>Reset hand</Text>
        </Pressable>
      </ThemedView>

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
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? "rgba(0, 122, 255, 0.5)"
                : "rgb(0, 122, 255)",
            },
            styles.resetAllButton,
          ]}
          onPress={handleResetAll}
        >
          <Text style={styles.resetCycleText}>Reset</Text>
        </Pressable>
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
    // paddingTop: 8,
    // paddingBottom: 0,
  },
  segment: {
    marginBottom: 10,
  },
  weightContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
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
  resetCycleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  resetCycleButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    margin: 12,
    width: 160,
  },
  resetCycleText: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 24,
  },
  summaryContainer: {
    marginTop: 8,
    padding: 8,
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
  resetAllButton: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    width: "100%",
  },
});
