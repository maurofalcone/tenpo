jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("@expo/vector-icons", () => require("./mocks/vector-icons"));

jest.mock("nativewind", () => ({
  useColorScheme: () => ({
    colorScheme: "light",
    setColorScheme: jest.fn(),
    toggleColorScheme: jest.fn(),
  }),
}));
