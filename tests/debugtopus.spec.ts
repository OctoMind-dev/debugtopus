import {
  createPlaywrightCommand,
  getConfig,
  getPackageRootLevel,
  prepareTestRun,
} from "../src/debugtopus";
import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";
import fs from "fs/promises";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn(jest.requireActual("fs").existsSync),
}));

jest.mock("");

describe("debugtopus", () => {
  const packageRootDir = path.join(__dirname, "..");
  const tempDir = path.join(packageRootDir, "temp");
  const testCode1 = `import { test, expect, chromium, Browser, type Locator } from "@playwright/test";

  test.describe("test description", () => {
    test("it should be able to run playwright", () => {
      expect(true).toBeTruthy();
    });
  });`;

  const testCode2 = `import { test, expect, chromium, Browser, type Locator } from "@playwright/test";

  test.describe("some other test description", () => {
    test("it should be able to run playwright again", () => {
      expect(false).toBeFalsy();
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

  describe(prepareTestRun.name, () => {
    it.each([
      {
        testsToPrepare: [
          { code: testCode1, id: "id1", description: "description1" },
        ],
      },
      {
        testsToPrepare: [
          { code: testCode1, id: "id1" },
          { code: testCode2, id: "id2", description: "description2" },
        ],
      },
    ])(
      "generates the correct files for '$testsToPrepare.length' test case(s) ",
      async ({ testsToPrepare }) => {
        const { testFilePaths, testDirectory, configFilePath, outputDir } =
          await prepareTestRun({
            url,
            testCasesWithCode: testsToPrepare,
          });

        expect(testFilePaths).toHaveLength(testsToPrepare.length);
        const dirContents = readdirSync(testDirectory);
        expect(dirContents.length).toEqual(testsToPrepare.length + 1);

        for (const [index, testCase] of Object.values(
          testsToPrepare,
        ).entries()) {
          expect(testFilePaths[index]).toContain(
            `${testCase.description ?? testCase.id}`,
          );
          const testFileContent = readFileSync(testFilePaths[index], {
            encoding: "utf-8",
          });
          expect(testFileContent).toEqual(testCase.code);
        }

        const configFileContent = readFileSync(configFilePath, {
          encoding: "utf-8",
        });
        expect(configFileContent).toEqual(getConfig(url, outputDir));
      },
    );
  });

  describe(getPackageRootLevel.name, () => {
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
      },
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
          "can't find root level node modules",
        );
      },
    );
  });

  describe(getConfig.name, () => {
    it("should replace broken octal escape sequences for windows paths", () => {
      const brokenWindowsOutputPath = "some/broken/path/1234".replaceAll(
        "/",
        "\\",
      );

      const config = getConfig("doesn't/matter", brokenWindowsOutputPath);

      expect(config).toContain('outputDir: "some\\\\broken\\\\path\\\\1234"');
    });
  });

  describe(createPlaywrightCommand.name, () => {
    it("should not have \\ in command path", async () => {
      const backslashPath = "C:\\User\\Some\\Path";

      const command = createPlaywrightCommand({
        configFilePath: backslashPath,
        testDirectory: backslashPath,
      });

      expect(command).not.toContain("\\");
    });
  });
});
