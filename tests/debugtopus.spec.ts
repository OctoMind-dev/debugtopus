import axios from "axios";
import { getConfig, prepareTestRun } from "../src/debugtopus";
import { readFileSync } from "fs";

jest.mock("axios");

describe("prepareTestRun", () => {
  const testCode = "this is the test code";
  const url = "https://foo.bar";
  const testId = "testId";
  const token = "token";
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { testCode },
    });
  });

  it("generates the correct files", async () => {
    const { testFilePath, configFilePath, outputDir } = await prepareTestRun({
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
      `http://localhost:3000/api/v1/test-cases/${testId}/code?url=${encodeURI(
        url
      )}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  });
});
