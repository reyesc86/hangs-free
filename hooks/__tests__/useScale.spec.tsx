import { Buffer } from "buffer";

import { renderHook, act } from "@testing-library/react-native";

import { useBLE } from "../useBLE";
import { useScale } from "../useScale";

jest.mock("../useBLE", () => ({
  useBLE: jest.fn(),
}));

const renderUseScale = () => {
  return renderHook(() => useScale({ selectedDevice: "whc06" }));
};

describe("useScale", () => {
  const mockBleManager = {
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useBLE as jest.Mock).mockReturnValue({
      bleManager: mockBleManager,
      bleInitialized: true,
    });
  });

  it("initializes with default values", () => {
    const { result } = renderUseScale();

    expect(result.current.weightData).toEqual({
      weight: 0,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toEqual([]);
  });

  it("starts scanning when initialized", () => {
    renderUseScale();

    expect(mockBleManager.startDeviceScan).toHaveBeenCalled();
  });

  it("does not start scanning when BLE is not initialized", () => {
    (useBLE as jest.Mock).mockReturnValue({
      bleManager: mockBleManager,
      bleInitialized: false,
    });

    renderUseScale();
    expect(mockBleManager.startDeviceScan).not.toHaveBeenCalled();
  });

  it("updates weight data when valid data is received", () => {
    const { result } = renderUseScale();

    // Create mock manufacturer data (weight of 75.5kg)
    // 75.5 * 100 = 7550 = 0x1D7E in hex = [29, 126] in decimal
    const weightBytes = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 212, 29, 126,
    ]);
    const manufacturerData = weightBytes.toString("base64");

    // Simulate device scan callback
    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData,
      });
    });

    expect(result.current.weightData).toEqual({
      weight: 75.5,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toHaveLength(1);
    expect(result.current.weightDataPoints[0]).toMatchObject({
      weight: 75.5,
    });
  });

  it("adds more weight data points when the weight changes", () => {
    const { result } = renderUseScale();

    // Create mock manufacturer data (weight of 75.5kg)
    // 75.5 * 100 = 7550 = 0x1D7E in hex = [29, 126] in decimal
    const weightBytes1 = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 212, 29, 126,
    ]);
    const manufacturerData1 = weightBytes1.toString("base64");

    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData: manufacturerData1,
      });
    });

    expect(result.current.weightDataPoints).toHaveLength(1);
    expect(result.current.weightDataPoints[0]).toMatchObject({
      weight: 75.5,
    });

    // Create mock manufacturer data (weight of 76.5kg)
    // 76.5 * 100 = 7650 = 0x1DE2 in hex = [29, 226] in decimal
    const weightBytes2 = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 212, 29, 226,
    ]);
    const manufacturerData2 = weightBytes2.toString("base64");

    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData: manufacturerData2,
      });
    });

    expect(result.current.weightData).toEqual({
      weight: 76.5,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toHaveLength(2);
    expect(result.current.weightDataPoints[1]).toMatchObject({
      weight: 76.5,
    });

    // Create mock manufacturer data (weight of 70kg)
    // 70 * 100 = 7000 = 0x1B58 in hex = [27, 88] in decimal
    const weightBytes3 = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 212, 27, 88,
    ]);
    const manufacturerData3 = weightBytes3.toString("base64");

    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData: manufacturerData3,
      });
    });

    expect(result.current.weightData).toEqual({
      weight: 70,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toHaveLength(3);
    expect(result.current.weightDataPoints[2]).toMatchObject({
      weight: 70,
    });
  });

  it("converts weight data units appropriately", () => {
    const { result } = renderUseScale();
    // Create mock manufacturer data (weight of 165.35 pounds)
    // 165.35 * 100 = 16535 = 0x4097 in hex = [64, 151] in decimal
    const weightBytes = Buffer.from([   
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 64, 151,
    ]);
    const manufacturerData = weightBytes.toString("base64");
    // Simulate device scan callback
    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData,
      });
    });
    console.log(result.current.weightData);
    expect(result.current.weightData).toEqual({
      weight: 75.0, // 165.35 pounds converted to kg
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toHaveLength(1);
    expect(result.current.weightDataPoints[0]).toMatchObject({
      weight: 75.0,
    });

    // make sure it doesn't convert when not needed
    // Create mock manufacturer data (weight of 75.5kg)
    // 75.5 * 100 = 7550 = 0x1D7E in hex = [29, 126] in decimal
    const weightBytes2 = Buffer.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 212, 29, 126,
    ]);
    const manufacturerData2 = weightBytes2.toString("base64");
    act(() => {
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, {
        name: "IF_B7_TEST",
        manufacturerData: manufacturerData2,
      });
    });
    expect(result.current.weightData).toEqual({
      weight: 75.5,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toHaveLength(2);
    expect(result.current.weightDataPoints[1]).toMatchObject({
      weight: 75.5,
    }); 
  });

  it("resets weight data", () => {
    const { result } = renderUseScale();

    act(() => {
      result.current.reset();
    });

    expect(result.current.weightData).toEqual({
      weight: 0,
      unit: "kg",
    });
    expect(result.current.weightDataPoints).toEqual([]);
  });

  it("stops scanning on unmount", () => {
    const { unmount } = renderUseScale();
    unmount();
    expect(mockBleManager.stopDeviceScan).toHaveBeenCalled();
  });
});
