import { existsSync, writeFileSync } from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { randomUUID } from "crypto";
import path, { dirname } from "path";
import fs from "fs/promises";
import { ensureChromiumIsInstalled } from "./installation";
import { TestCase } from "./octomind-api";

export const getConfig = (url: string, outputDir: string) => `
import { defineConfig, devices } from "@playwright/test";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  use: {
    baseURL: "${url}",
  },
  timeout: 600_000,
  outputDir: "${outputDir.replaceAll("\\", "\\\\")}",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
`;

export const getPackageRootLevel = (appDir: string): string => {
  let infiniteLoopPrevention = 5;
  let rootDir = appDir;

  while (infiniteLoopPrevention > 0) {
    const nodeDir = path.join(rootDir, "node_modules");
    if (existsSync(nodeDir)) {
      break;
    }

    rootDir = path.join(rootDir, "..");
    infiniteLoopPrevention -= 1;
  }

  if (infiniteLoopPrevention === 0) {
    throw new Error("can't find root level node modules");
  }

  return rootDir;
};

export type TestPreparationResult = {
  configFilePath: string;
  testFilePaths: string[];
  testDirectory: string;
  outputDir: string;
  packageRootDir: string;
};

export type TestCaseWithCode = TestCase & { code: string };

export const prepareTestRun = async ({
  url,
  testCasesWithCode,
  packageRootDir,
}: {
  url: string;
  testCasesWithCode: TestCaseWithCode[];
  packageRootDir?: string;
}): Promise<TestPreparationResult> => {
  if (!packageRootDir) {
    // at runtime, we are installed in an arbitrary npx cache folder,
    // we need to find the rootDir ourselves and cannot rely on paths relative to src
    const nodeModule = require.main;
    if (!nodeModule) {
      throw new Error("package was not installed as valid nodeJS module");
    }
    const appDir = dirname(nodeModule.filename);
    packageRootDir = getPackageRootLevel(appDir);
  }

  const tempDir = path.join(packageRootDir, "temp");

  if (existsSync(tempDir)) {
    await fs.rm(tempDir, { force: true, recursive: true });
  }

  await fs.mkdir(tempDir);

  const outputDir = path.join(tempDir, "output");

  const testFilePaths: string[] = [];

  for (const testCase of testCasesWithCode) {
    const fileNameUUID = randomUUID();
    const testFilePath = path.join(
      tempDir,
      `${testCase.description ?? testCase.id}-${fileNameUUID}.spec.ts`,
    );
    writeFileSync(testFilePath, testCase.code);
    testFilePaths.push(testFilePath);
  }

  const fileNameUUID = randomUUID();
  const configFilePath = path.join(tempDir, `${fileNameUUID}.config.ts`);
  writeFileSync(configFilePath, getConfig(url, outputDir));

  return {
    testFilePaths,
    configFilePath,
    testDirectory: tempDir,
    outputDir,
    packageRootDir,
  };
};

export const createPlaywrightCommand = ({
  configFilePath,
  testDirectory,
}: {
  configFilePath: string;
  testDirectory: string;
}): string =>
  `npx playwright test --config=${configFilePath.replaceAll(
    "\\",
    "/",
  )} ${testDirectory.replaceAll("\\", "/")}`;

export const runTests = async ({
  configFilePath,
  testDirectory,
  outputDir,
  runMode,
  packageRootDir,
}: {
  configFilePath: string;
  testDirectory: string;
  outputDir: string;
  packageRootDir: string;
  runMode: "ui" | "headless";
}): Promise<void> => {
  await ensureChromiumIsInstalled(packageRootDir);

  let command = createPlaywrightCommand({ configFilePath, testDirectory });

  if (runMode === "ui") {
    command += " --ui";
  }

  // eslint-disable-next-line no-console
  console.log(`executing command : '${command}'`);

  const { stderr } = await promisify(exec)(command, {
    cwd: packageRootDir,
  });

  if (stderr) {
    // eslint-disable-next-line no-console
    console.error(stderr);
    process.exit(1);
  } else {
    // eslint-disable-next-line no-console
    console.log(`success, you can find your artifacts at ${outputDir}`);
  }
};
