import axios from "axios";
import {
  getConfig,
  prepareTestRun,
  getTempDirOnPackageRootLevel,
} from "../src/debugtopus";
import { readFileSync, existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

jest.mock("axios");
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn(jest.requireActual("fs").existsSync),
}));

describe("prepareTestRun", () => {
  const testCode = "";
  const url = "https://foo.bar";
  const testId = "testId";
  const token = "token";
  const octomindUrl = "https://app.octomind.dev";
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { testCode },
    });
  });

  afterEach(async () => {
    try {
      await fs.rm("temp", { recursive: true });
    } catch (error) {
      // we don't care
    }
  });

  it("generates the correct files", async () => {
    const { testFilePath, configFilePath, outputDir } = await prepareTestRun({
      octomindUrl,
      token,
      testId,
      url,
    });
    const testFileContent = readFileSync(testFilePath, { encoding: "utf-8" });
    expect(testFileContent).toEqual(testCode);

    const configFileContent = readFileSync(configFilePath, {
      encoding: "utf-8",
    });
    expect(configFileContent).toEqual(getConfig(url, outputDir));

    expect(axios.get).toHaveBeenCalledWith(
      `https://app.octomind.dev/api/v1/test-cases/${testId}/code?executionUrl=${encodeURI(
        url
      )}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
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
      const dir = getTempDirOnPackageRootLevel(appDir);
      const levelUps = Array(numberOfLevelsToRoot)
        .fill("")
        .map(() => "..");

      const expectedDir = path.join(appDir, ...levelUps, "temp");
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

      expect(() => getTempDirOnPackageRootLevel(appDir)).toThrowError(
        "can't find root level node modules"
      );
    }
  );
});
