import { webkit, chromium, firefox } from "@playwright/test";
import fsPromises from "fs/promises";
import { promisify } from "util";
import { exec } from "child_process";

export const ensureBrowsersAreInstalled = async (
  packageRootDir: string,
): Promise<void> => {
  const chromiumPath = chromium.executablePath();
  const safariPath = webkit.executablePath();
  const firefoxPath = firefox.executablePath();

  const accessed = await Promise.allSettled([
    fsPromises.access(chromiumPath),
    fsPromises.access(safariPath),
    fsPromises.access(firefoxPath),
  ]);

  if (accessed.every((a) => a.status === "fulfilled")) {
    return;
  }

  const playwrightInstallExecution = promisify(exec)("npx playwright install", {
    cwd: packageRootDir,
  });

  playwrightInstallExecution.child?.stdout?.on("data", (data) =>
    // eslint-disable-next-line no-console
    console.log(data),
  );

  await playwrightInstallExecution;
};
