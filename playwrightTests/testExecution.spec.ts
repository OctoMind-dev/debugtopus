// eslint-disable-next-line filenames/match-regex
import { test } from "@playwright/test";
import fs from "fs/promises";
import { prepareTestRun, runTest } from "../src/debugtopus";
import path from "path";

test.describe("test execution", () => {
  const testCode = `import { test, expect, chromium, Browser, type Locator } from "@playwright/test";

  test.describe("test description", () => {
    test("it should be able to run playwright", () => {
      expect(true).toBeTruthy();
    });
  });`;

  test.afterEach(async () => {
    try {
      await fs.rm("temp", { recursive: true });
    } catch (error) {
      // we don't care
    }
  });

  test("it can execute playwright", async () => {
    const packageRootDir = path.join(__dirname, "..");
    const preparationResults = await prepareTestRun({
      code: testCode,
      url: "https://codesphere.com/ide/signin?variant=dark",
      packageRootDir,
    });

    await runTest(preparationResults);
  });

  test("it can execute playwright from an arbitrary folder", async () => {
    process.chdir("..");
    const packageRootDir = path.join(__dirname, "..");

    const preparationResults = await prepareTestRun({
      code: testCode,
      url: "https://codesphere.com/ide/signin?variant=dark",
      packageRootDir,
    });

    await runTest(preparationResults);
  });
});
