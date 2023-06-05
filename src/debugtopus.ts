import { Command } from "commander";
import { dirSync } from "tmp";
import { writeFileSync } from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { randomUUID } from "crypto";
import path from "path";

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

export const prepareTestRun = async ({
  token,
  url,
  testId,
}: {
  token: string;
  url: string;
  testId: string;
}): Promise<{
  configFilePath: string;
  testFilePath: string;
  outputDir: string;
}> => {
  const code = await getPlaywrightCode(testId, token, url);

  const tempDir = dirSync();
  const testFilePath = path.join(tempDir.name, `${randomUUID()}.spec.ts`);
  writeFileSync(testFilePath, code);

  const configFilePath = path.join(tempDir.name, `${randomUUID()}.config.ts`);
  const outputDir = dirSync();
  writeFileSync(configFilePath, getConfig(url, outputDir.name));

  return { testFilePath, configFilePath, outputDir: outputDir.name };
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
    .parse(process.argv);

  const options = program.opts();

  const { configFilePath, testFilePath, outputDir } = await prepareTestRun({
    testId: options.id,
    token: options.token,
    url: options.url,
  });

  const command = `npx playwright test --ui --config=${configFilePath} ${testFilePath}`;

  const { stderr } = await promisify(exec)(command);
  if (stderr) {
    console.error(stderr);
  } else {
    console.log(`success, you can find your artifacts at ${outputDir}`);
  }
};
