import { useEffect, useState, useCallback } from "react";

import { Platform } from "react-native";
import { BleError, Device, ScanMode } from "react-native-ble-plx";

import { Buffer } from "buffer";

import { useBLE } from "./useBLE";

const isAndroid = Platform.OS === "android";

interface WeightData {
  weight: number;
  unit: "kg" | "lb";
}

// Constants
const DEVICE_NAME_PATTERN = "IF_B7"; // WH-C06 Bluetooth Scale
const MAX_DATA_POINTS = 1000; // Prevent memory leaks by limiting data points
const WEIGHT_DATA_BYTE_OFFSET = 12;

const getWeightData = (manufacturerData: string): WeightData | undefined => {
  try {
    const data = Array.from(Buffer.from(manufacturerData, "base64"));

    // Add validation for data length
    if (data.length < WEIGHT_DATA_BYTE_OFFSET + 2) {
      throw new Error("Invalid manufacturer data length");
    }

    // Convert two bytes to a 16-bit integer (big-endian)
    const weight =
      (data[WEIGHT_DATA_BYTE_OFFSET] * 256 +
        data[WEIGHT_DATA_BYTE_OFFSET + 1]) /
      100;

    // Validate weight is a reasonable number
    if (isNaN(weight) || weight < 0 || weight > 1000) {
      throw new Error("Invalid weight value");
    }

    return { weight, unit: "kg" };
  } catch (e) {
    console.error("Error parsing weight data:", e);
    return undefined;
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
  const { bleManager, bleInitialized } = useBLE();

  const reset = useCallback(() => {
    setWeightData(initialWeightData);
    setWeightDataPoints([]);
  }, []);

  const scan = useCallback((error: BleError | null, device: Device | null) => {
    if (error) {
      console.error("Scan error:", error);
      return;
    }

    const manufacturerData = device?.manufacturerData;
    if (!manufacturerData || !device?.name?.includes(DEVICE_NAME_PATTERN)) {
      return;
    }

    const data = getWeightData(manufacturerData);
    if (!data) return;

    setWeightData((prevState) => ({
      unit: data.unit,
      weight: data.weight,
      maxWeight: Math.max(data.weight, prevState.maxWeight),
    }));

    setWeightDataPoints((prev) => {
      const newPoints = [
        ...prev,
        { weight: data.weight, timestamp: Date.now() },
      ].slice(-MAX_DATA_POINTS); // Keep only the last MAX_DATA_POINTS
      return newPoints;
    });
  }, []);

  useEffect(() => {
    if (!bleInitialized) return;

    const scanOptions = isAndroid ? { scanMode: ScanMode.LowLatency } : null;
    bleManager.startDeviceScan(null, scanOptions, scan);

    return () => {
      bleManager.stopDeviceScan();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bleInitialized, scan]);

  return { weightData, weightDataPoints, reset };
};
