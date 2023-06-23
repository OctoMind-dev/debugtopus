import { chromium } from "@playwright/test";
import { access } from "fs";
import fs from "fs/promises";
import { promisify } from "util";
import { exec } from "child_process";

export const ensureChromiumIsInstalled = async (
  packageRootDir: string
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
      console.log(
        "Couldn't find any chromium binary, executing 'npx playwright install chromium'"
      );

      const playwrightInstallExecution = promisify(exec)(
        "npx playwright install chromium",
        {
          cwd: packageRootDir,
        }
      );

      playwrightInstallExecution.child?.stdout?.on("data", (data) =>
        console.log(data)
      );

      await playwrightInstallExecution;

      resolve();
    });
  });
};
