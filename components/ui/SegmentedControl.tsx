import { StyleSheet, Pressable, View, useColorScheme } from "react-native";

import { ThemedText } from "./ThemedText";

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
          backgroundColor: isDark ? "#2C2C2E" : "#E9E9EB",
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
              { backgroundColor: isDark ? "#4C4C4E" : "#FFFFFF" },
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
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 0,
  },
  segment: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  selectedSegment: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 10,
    zIndex: 10,
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
