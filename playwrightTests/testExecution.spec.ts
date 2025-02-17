// eslint-disable-next-line filenames/match-regex
import { test } from "@playwright/test";
import { prepareDirectories, runTests, writeConfigAndTests } from "../src/debugtopus";
import path from "path";
import { mockedConfig } from "../tests/mocks";

test.describe("test execution", () => {
  const testCode1 = `import { test, expect, chromium, Browser, type Locator } from "@playwright/test";

  test.describe("test description", () => {
    test("it should be able to run playwright", () => {
      expect(true).toBeTruthy();
    });
  });`;

  const testCode2 = `import { test, expect, chromium, Browser, type Locator } from "@playwright/test";

  test.describe("test description 2", () => {
    test("it should be able to run playwright again", () => {
      expect(false).toBeFalsy();
    });
  });`;

  const otpImportCode = `import otplib from "otplib";
  import { test, expect, chromium, Browser, type Locator } from "@playwright/test";

  test.describe("test description", () => {
    test("it should be able to run playwright", () => {
      console.log(otplib);
      expect(true).toBeTruthy();
    });
  });`;

  for (const codePerTest of [[testCode1], [testCode1, testCode2]]) {
    test(`it can execute playwright for '${codePerTest.length}' test(s)`, async () => {
      const packageRootDir = path.join(__dirname, "..");
      const dirs = await prepareDirectories(packageRootDir);
      writeConfigAndTests({
        testCasesWithCode: codePerTest.map((code, index) => ({
          id: `${index}`,
          code,
        })),
        config: mockedConfig,
        dirs,
      });

      await runTests({ ...dirs, runMode: "headless" });
    });
  }

  test("it can execute playwright from an arbitrary folder", async () => {
    const packageRootDir = path.join(__dirname, "..");
    const dirs = await prepareDirectories(packageRootDir);
    writeConfigAndTests({
      testCasesWithCode: [
        { code: testCode1, id: "id", description: "someDescription" },
      ],
      config: mockedConfig,
      dirs,
    });

    await runTests({ ...dirs, runMode: "headless" });
  });

  test("it can import otplib in a test", async () => {
    const packageRootDir = path.join(__dirname, "..");
    const dirs = await prepareDirectories(packageRootDir);
    writeConfigAndTests({
      testCasesWithCode: [
        { code: otpImportCode, id: "id", description: "someDescription" },
      ],
      config: mockedConfig,
      dirs,
    });

    await runTests({ ...dirs, runMode: "headless" });
  });
});
