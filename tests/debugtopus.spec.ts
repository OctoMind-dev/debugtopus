import {
  getConfig,
  getPackageRootLevel,
  prepareTestRun,
} from "../src/debugtopus";
import { existsSync, readFileSync } from "fs";
import path from "path";
import fs from "fs/promises";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn(jest.requireActual("fs").existsSync),
}));

describe("prepareTestRun", () => {
  const packageRootDir = path.join(__dirname, "..");
  const tempDir = path.join(packageRootDir, "temp");
  const testCode = `import { test, expect, chromium, Browser, type Locator } from "@playwright/test";

  test.describe("test description", () => {
    test("it should be able to run playwright", () => {
      expect(true).toBeTruthy();
    });
  });`;

  const url = "https://octomind.dev";

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true });
    } catch (error) {
      // we don't care
    }
  });

  it("generates the correct files", async () => {
    const { testFilePath, configFilePath, outputDir } = await prepareTestRun({
      url,
      code: testCode,
    });
    const testFileContent = readFileSync(testFilePath, { encoding: "utf-8" });
    expect(testFileContent).toEqual(testCode);

    const configFileContent = readFileSync(configFilePath, {
      encoding: "utf-8",
    });
    expect(configFileContent).toEqual(getConfig(url, outputDir));
  });

  it.each([0, 1, 2, 3, 4])(
    "gets root dir correctly",
    async (numberOfLevelsToRoot) => {
      let callCount = -1;
      jest.mocked(existsSync).mockImplementation(() => {
        callCount++;
        return callCount === numberOfLevelsToRoot;
      });

      const appDir = "someDir";
      const dir = getPackageRootLevel(appDir);
      const levelUps = Array(numberOfLevelsToRoot)
        .fill("")
        .map(() => "..");

      const expectedDir = path.join(appDir, ...levelUps);
      expect(dir).toEqual(expectedDir);
    }
  );

  it.each([5, 6, 10, 100])(
    "raises error when %s levels",
    async (numberOfLevelsToRoot) => {
      let callCount = -1;
      jest.mocked(existsSync).mockImplementation(() => {
        callCount++;
        return callCount === numberOfLevelsToRoot;
      });

      const appDir = "someDir";

      expect(() => getPackageRootLevel(appDir)).toThrowError(
        "can't find root level node modules"
      );
    }
  );
});
