import { Command } from "commander";
import { getPlaywrightCode } from "./octomind-api";

import { fileSync } from "tmp";
import { writeFileSync } from "fs";
import { promisify } from "util";
import { exec } from "child_process";

const getConfig = (url) => `
import { defineConfig, devices } from "@playwright/test";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  use: {
    baseURL: "${url}",
  },

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
    .argument("<url>", "url the tests should run against")
    .parse(process.argv);

  const options = program.opts();

  const code = await getPlaywrightCode(options.id, options.token);

  const testFile = fileSync();
  writeFileSync(testFile.name, code);

  const configFile = fileSync();
  writeFileSync(configFile.name, getConfig(options.localEnvironmentUrl));

  const command = `npx playwright test --config=${configFile.name} ${testFile.name}`;

  const { stdout, stderr } = await promisify(exec)(command);
  // eslint-disable-next-line no-console
  console.info({ stdout, stderr });
};
