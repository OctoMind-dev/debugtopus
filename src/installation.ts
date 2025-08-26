import { chromium } from "@playwright/test";
import { exec } from "child_process";
import { access } from "fs";
import fs from "fs/promises";
import { promisify } from "util";

export const ensureChromiumIsInstalled = async (
  packageRootDir: string,
): Promise<void> => {
  const file = chromium.executablePath();

  await new Promise<void>((resolve, reject) => {
    access(file, fs.constants.X_OK, async (error) => {
      if (!error) {
        resolve();
        return;
      }
      if (error.code !== "ENOENT") {
        reject(error);
        return;
      }
      // eslint-disable-next-line no-console
      console.log(
        "Couldn't find any chromium binary, executing 'npx playwright install chromium'",
      );

      const playwrightInstallExecution = promisify(exec)(
        "npx playwright install chromium",
        {
          cwd: packageRootDir,
        },
      );

      playwrightInstallExecution.child?.stdout?.on("data", (data) =>
        // eslint-disable-next-line no-console
        console.log(data),
      );

      await playwrightInstallExecution;

      resolve();
    });
  });
};
