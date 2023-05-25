import type jest from "jest";

const jestConfig: jest.Config = {
  preset: "ts-jest",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["dist", "node_modules"],
};

// noinspection JSUnusedGlobalSymbols
export default jestConfig;
