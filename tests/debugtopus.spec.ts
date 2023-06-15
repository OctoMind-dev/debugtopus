import axios from "axios";
import { getConfig, prepareTestRun } from "../src/debugtopus";
import { readFileSync } from "fs";
import fs from "fs/promises";

jest.mock("axios");

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
    await fs.rm("temp", { recursive: true });
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
});
