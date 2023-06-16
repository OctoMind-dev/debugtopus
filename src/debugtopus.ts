import { Command } from "commander";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { randomUUID } from "crypto";
import path, { dirname } from "path";
import { getPlaywrightCode } from "./octomind-api";

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

const getTempDirOnPackageRootLevel = (inputDir: string): string => {
  let infiniteLoopPrevention = 5;
  let appDir = inputDir;

  while (infiniteLoopPrevention > 0) {
    const nodeDir = path.join(appDir, "node_modules");
    if (existsSync(nodeDir)) {
      break;
    }
    appDir = path.join(appDir, "..");

    infiniteLoopPrevention -= 1;
  }

  if (infiniteLoopPrevention === 0) {
    throw new Error("can't find root level node modules :/");
  }

  const tempDir = path.join(appDir, "temp");
  return tempDir;
};

export const prepareTestRun = async ({
  token,
  url,
  testId,
  octomindUrl,
}: {
  token: string;
  url: string;
  testId: string;
  octomindUrl: string;
}): Promise<{
  configFilePath: string;
  testFilePath: string;
  outputDir: string;
}> => {
  const code = await getPlaywrightCode(testId, token, url, octomindUrl);

  const nodeModule = require.main;
  if (!nodeModule) {
    throw new Error("package was not installed as valid nodeJS module");
  }
  const appDir = dirname(nodeModule.filename);
  const tempDir = getTempDirOnPackageRootLevel(appDir);
  const outputDir = "output";

  if (!existsSync(tempDir)) {
    mkdirSync(tempDir);
  }
  const testFilePath = path.join(tempDir, `${randomUUID()}.spec.ts`);
  writeFileSync(testFilePath, code);

  const configFilePath = path.join(tempDir, `${randomUUID()}.config.ts`);
  writeFileSync(configFilePath, getConfig(url, outputDir));

  return { testFilePath, configFilePath, outputDir };
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

  const { configFilePath, testFilePath, outputDir } = await prepareTestRun({
    testId: options.id,
    token: options.token,
    url: options.url,
    octomindUrl: options.octomindUrl,
  });

  const command = `npx playwright test --ui --config=${configFilePath} ${testFilePath}`;

  const { stderr } = await promisify(exec)(command);
  if (stderr) {
    console.error(stderr);
  } else {
    console.log(`success, you can find your artifacts at ${outputDir}`);
  }
};
