/* eslint-env jest */

// Mock react-native-ble-plx
jest.mock("react-native-ble-plx", () => {
  return {
    BleManager: jest.fn().mockImplementation(() => ({
      startDeviceScan: jest.fn(),
      stopDeviceScan: jest.fn(),
      connectToDevice: jest.fn(),
      monitorCharacteristicForDevice: jest.fn(),
      cancelTransaction: jest.fn(),
      isDeviceConnected: jest.fn(),
      discoverAllServicesAndCharacteristicsForDevice: jest.fn(),
      readCharacteristicForDevice: jest.fn(),
      writeCharacteristicWithResponseForDevice: jest.fn(),
      destroy: jest.fn(),
    })),
  };
});

// Add any other global mocks your tests need
