import type jest from "jest";

const jestConfig: jest.Config = {
  preset: "ts-jest",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["dist", "node_modules"],
  testTimeout: 100_000,
};

// noinspection JSUnusedGlobalSymbols
export default jestConfig;
