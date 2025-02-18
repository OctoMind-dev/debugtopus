import { DebugtopusOptions } from "../src/cli";
import { TestDirectories } from "../src/debugtopus";

export const mockedConfig = `
import { defineConfig, devices } from "@playwright/test";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  use: {
    headless: false,
    baseURL: "https://codesphere.com/ide/signin?variant=dark",
    
  },
  timeout: 600_000,
  outputDir: "bar",
  extraHTTPHeaders: {
    "sec-ch-ua": '"Not)A;Brand";v="99"',
    
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
`;

export const createMockTestDirectories = (
  overrides?: Partial<TestDirectories>,
): TestDirectories => ({
  configFilePath: "/some/path/config.ts",
  testDirectory: "/some/path",
  outputDir: "/some/path/output",
  packageRootDir: "/some/package/root/dir",
  ...overrides,
});

export const createMockOptions = (
  overrides?: Partial<DebugtopusOptions>,
): DebugtopusOptions => ({
  testTargetId: "testTargetId",
  token: "token",
  id: "testCaseId",
  octomindUrl: "https://app.octomind.dev",
  url: "http://localhost:3000",
  ...overrides,
});
