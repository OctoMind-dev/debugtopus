import { DebugtopusOptions } from "../src/cli";
import { TestPreparationResult } from "../src/debugtopus";

export const createMockTestPreparationResult = (
  overrides?: Partial<TestPreparationResult>,
): TestPreparationResult => ({
  configFilePath: "/some/path/config.ts",
  testDirectory: "/some/path",
  testFilePaths: ["/some/path/test1.spec.ts", "/some/path/test2.spec.ts"],
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
