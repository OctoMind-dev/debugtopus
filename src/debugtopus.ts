import { Command } from "commander";
import { existsSync, writeFileSync } from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { randomUUID } from "crypto";
import path, { dirname } from "path";
import { getPlaywrightCode } from "./octomind-api";
import fs from "fs/promises";

export const getConfig = (url: string, outputDir: string) => `
import { defineConfig, devices } from "@playwright/test";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  use: {
    baseURL: "${url}",
  },
  outputDir: "${outputDir}",
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

export const prepareTestRun = async ({
  url,
  code,
  packageRootDir,
}: {
  url: string;
  code: string;
  packageRootDir?: string;
}): Promise<{
  configFilePath: string;
  testFilePath: string;
  outputDir: string;
  packageRootDir: string;
}> => {
  if (!packageRootDir) {
    // at runtime we are installed in an arbitrary npx cache folder,
    // we need to find the rootDir ourselves and cannot rely on paths relative to src
    const nodeModule = require.main;
    if (!nodeModule) {
      throw new Error("package was not installed as valid nodeJS module");
    }
    const appDir = dirname(nodeModule.filename);
    packageRootDir = getPackageRootLevel(appDir);
  }

  const tempDir = path.join(packageRootDir, "temp");

  if (!existsSync(tempDir)) {
    await fs.mkdir(tempDir);
  }

  const outputDir = path.join(tempDir, "output");

  const testFilePath = path.join(tempDir, `${randomUUID()}.spec.ts`);
  writeFileSync(testFilePath, code);

  const configFilePath = path.join(tempDir, `${randomUUID()}.config.ts`);
  writeFileSync(configFilePath, getConfig(url, outputDir));

  return { testFilePath, configFilePath, outputDir, packageRootDir };
};

export const runTest = async ({
  configFilePath,
  testFilePath,
  outputDir,
  runMode,
  packageRootDir,
}: {
  configFilePath: string;
  testFilePath: string;
  outputDir: string;
  packageRootDir: string;
  runMode: "ui" | "headless";
}): Promise<void> => {
  let command = `npx playwright test --config=${configFilePath} ${testFilePath}`;

  if (runMode === "ui") {
    command += "--ui";
  }

  const { stderr } = await promisify(exec)(command, {
    cwd: packageRootDir,
  });

  if (stderr) {
    console.error(stderr);
    process.exit(1);
  } else {
    console.log(`success, you can find your artifacts at ${outputDir}`);
  }
};

export const debugtopus = async (): Promise<void> => {
  const program = new Command();

  program
    .requiredOption(
      "-t, --token <string>",
      "token to authenticate against octomind api"
    )
    .requiredOption("-i, --id <uuid>", "id of the test case you want to run")
    .requiredOption("-u, --url <url>", "url the tests should run against")
    .option(
      "-o, --octomindUrl <url>",
      "base url of the octomind api",
      "https://app.octomind.dev"
    )
    .parse(process.argv);

  const options = program.opts();

  const testRunPreparationResults = await prepareTestRun({
    url: options.url,
    code: await getPlaywrightCode({
      testCaseId: options.id,
      token: options.token,
      url: options.url,
      octomindUrl: options.octomindUrl,
    }),
  });

  await runTest({ ...testRunPreparationResults, runMode: "headless" });
};
