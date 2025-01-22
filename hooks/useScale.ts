import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { BleError, Device, ScanMode } from "react-native-ble-plx";
import { useBLE } from "./useBLE";
import { Platform } from "react-native";

interface WeightData {
  weight: number;
  unit: "kg" | "lb";
}

const getWeightData = (manufacturerData: string) => {
  try {
    const data = Array.from(Buffer.from(manufacturerData, "base64"));

    // console.log("=== Weight Calculation ===");
    // console.log(`Byte 12: ${data[12]}`);
    // console.log(`Byte 13: ${data[13]}`);

    // Convert two bytes to a 16-bit integer (big-endian)
    const weight = (data[12] * 256 + data[13]) / 100;
    const isStable = data[16] === 1; // From STABLE_OFFSET in iOS code

    // console.log(`Result: ${weight}${isStable ? " (stable)" : " (unstable)"}`);
    // console.log("Full data:", data);
    // console.log("========================");

    return { weight, unit: "kg" } as WeightData; // iOS code doesn't show unit checking
  } catch (e) {
    console.log("Error parsing data:", e);
  }
};

export interface WeightDataWithMax extends WeightData {
  maxWeight: number;
}

export interface WeightDataPoint {
  weight: number;
  timestamp: number;
}

const initialWeightData: WeightDataWithMax = {
  weight: 0,
  maxWeight: 0,
  unit: "kg",
};

export const useScale = () => {
  const [weightData, setWeightData] =
    useState<WeightDataWithMax>(initialWeightData);
  const [weightDataPoints, setWeightDataPoints] = useState<WeightDataPoint[]>(
    []
  );
  const { bleManager } = useBLE();
  const isAndroid = Platform.OS === "android";

  const reset = () => {
    setWeightData(initialWeightData);
  };

  const scan = (error: BleError | null, device: Device | null) => {
    if (error) {
      console.log("Scan error:", error);
      return;
    }

    const manufacturerData = device?.manufacturerData;

    if (manufacturerData && device?.name?.includes("IF_B7")) {
      const data = getWeightData(manufacturerData);

      if (data) {
        setWeightData((prevState) => ({
          unit: data.unit,
          weight: data.weight,
          maxWeight:
            data.weight > prevState.maxWeight
              ? data.weight
              : prevState.maxWeight,
        }));
        setWeightDataPoints((prev) => [
          ...prev,
          { weight: data.weight, timestamp: Date.now() },
        ]);
      }
    }
  };

  useEffect(() => {
    bleManager.startDeviceScan(
      null,
      isAndroid ? { scanMode: ScanMode.LowLatency } : null,
      scan
    );

    return () => {
      bleManager.stopDeviceScan();
    };
  }, []);

  return { weightData, weightDataPoints, reset };
};
