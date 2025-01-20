import { StyleSheet, Pressable, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { useColorScheme } from "react-native";

interface SegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: any;
}

export function SegmentedControl({
  values,
  selectedIndex,
  onChange,
  style,
}: SegmentedControlProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.container,
        style,
        {
          backgroundColor: isDark ? "#1C1C1E" : "#E9E9EB",
        },
      ]}
    >
      {values.map((value, index) => (
        <Pressable
          key={value}
          style={[
            styles.segment,
            selectedIndex === index && [
              styles.selectedSegment,
              { backgroundColor: isDark ? "#2C2C2E" : "#FFFFFF" },
            ],
          ]}
          onPress={() => onChange(index)}
        >
          <ThemedText
            style={[
              styles.text,
              selectedIndex === index && styles.selectedText,
            ]}
          >
            {value}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  selectedSegment: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  text: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 16,
  },
  selectedText: {
    fontWeight: "600",
  },
});
