export interface WeightData {
  weight: number;
  unit: "kg" | "lb";
}

export interface WeightDataWithMax extends WeightData {
  maxWeight: number;
}

export interface WeightDataPoint {
  weight: number;
  timestamp: number;
}

export type HandType = "left" | "right";

export interface HandData {
  left: WeightDataWithMax;
  right: WeightDataWithMax;
}

export interface CycleData {
  left: WeightDataPoint[];
  right: WeightDataPoint[];
}
