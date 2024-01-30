import type jest from "jest";

const jestConfig: jest.Config = {
  preset: "ts-jest",
  testMatch: ["**/tests/**/*.spec.ts"],
  testPathIgnorePatterns: ["dist", "node_modules"],
  testTimeout: 20_000,
  watchPathIgnorePatterns: ["temp"],
  prettierPath: null, //https://github.com/jestjs/jest/issues/14305 -> jest 30 will support it
};

// noinspection JSUnusedGlobalSymbols
export default jestConfig;
