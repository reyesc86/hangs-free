import { useState } from "react";
import { Buffer } from "buffer";
import { BleManager } from "react-native-ble-plx";

interface WeightData {
  weight: number;
  unit: "kg" | "lb";
}

const getWeightData = (manufacturerData: string) => {
  try {
    const data = Array.from(Buffer.from(manufacturerData, "base64"));

    console.log("=== Weight Calculation ===");
    console.log(`Byte 12: ${data[12]}`);
    console.log(`Byte 13: ${data[13]}`);

    // Convert two bytes to a 16-bit integer (big-endian)
    const weight = (data[12] * 256 + data[13]) / 100;
    const isStable = data[16] === 1; // From STABLE_OFFSET in iOS code

    console.log(`Result: ${weight}${isStable ? " (stable)" : " (unstable)"}`);
    console.log("Full data:", data);
    console.log("========================");

    return { weight, unit: "kg" } as WeightData; // iOS code doesn't show unit checking
  } catch (e) {
    console.log("Error parsing data:", e);
  }
};

export const useScale = () => {
  const [weightData, setWeightData] = useState<WeightData | null>(null);

  const bleManager = new BleManager();

  const subscribeToWeightData = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        return;
      }

      const manufacturerData = device?.manufacturerData;

      if (manufacturerData && device?.name?.includes("IF_B7")) {
        const weightData = getWeightData(manufacturerData);

        if (weightData) {
          setWeightData(weightData);
        }
      }
    });

  return { bleManager, weightData, subscribeToWeightData };
};
