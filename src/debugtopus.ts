import { Command } from "commander";
import { dirSync } from "tmp";
import { writeFileSync } from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { randomUUID } from "crypto";
import path from "path";

import { getPlaywrightCode } from "./octomind-api";

const getConfig = (url: string, outputDir: string) => `
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

  const code = await getPlaywrightCode(options.id, options.token, options.url);

  const tempDir = dirSync();
  const testFileName = path.join(tempDir.name, `${randomUUID()}.spec.ts`);
  writeFileSync(testFileName, code);

  const configFileName = path.join(tempDir.name, `${randomUUID()}.config.ts`);
  const outputDir = dirSync();
  writeFileSync(
    configFileName,
    getConfig(options.localEnvironmentUrl, outputDir.name)
  );

  const command = `npx playwright test --ui --config=${configFileName} ${testFileName}`;

  const { stderr } = await promisify(exec)(command);
  if (stderr) {
    console.error(stderr);
  } else {
    console.log(`success, you can find your artifacts at ${outputDir.name}`);
  }
};
