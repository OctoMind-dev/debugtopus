import { Command } from "commander";
import { getPlaywrightCode } from "./octomind-api";

import { dirSync } from "tmp";
import { writeFileSync } from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { randomUUID } from "crypto";
import path from "path";

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
    .requiredOption("-u, --url <url>", "url the tests should run against")
    .parse(process.argv);

  const options = program.opts();

  const code = await getPlaywrightCode(options.id, options.token, options.url);

  const tempDir = dirSync();
  // const testFile = fileSync({ name: `${randomUUID()}.spec.ts` });
  const testFileName = path.join(tempDir.name, `${randomUUID()}.spec.ts`);
  writeFileSync(testFileName, code);

  // const configFile = fileSync({ name: `${randomUUID()}.config.ts` });
  const configFileName = path.join(tempDir.name, `${randomUUID()}.config.ts`);
  writeFileSync(configFileName, getConfig(options.localEnvironmentUrl));

  const command = `npx playwright test --ui --config=${configFileName} ${testFileName}`;

  const { stdout, stderr } = await promisify(exec)(command);
  // eslint-disable-next-line no-console
  console.info({ stdout, stderr });
};
