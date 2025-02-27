import axios, { AxiosError, type AxiosResponse } from "axios";
import {
  getPlaywrightCode,
  getPlaywrightConfig,
  getTestCases,
} from "../src/octomind-api";
import { mockedConfig } from "./mocks";

jest.mock("axios");

describe("octomind-api", () => {
  const testTargetId = "testTargetId";
  const token = "token";
  const octomindUrl = "https://app.octomind.dev";
  const environmentId = "123-123-123";

  describe(getPlaywrightConfig.name, () => {
    const url = "https://thisIsARealUrl.com";

    beforeEach(() => {
      jest.mocked(axios.get).mockResolvedValue({
        data: { mockedConfig },
      });
    });
    it("fetches the correct config with authentication", async () => {
      await getPlaywrightConfig({
        token,
        url,
        octomindUrl,
        testTargetId,
        environmentId,
        outputDir: "/tmp/foo",
      });
      expect(axios.get).toHaveBeenCalledWith(
        `https://app.octomind.dev/api/bearer/v1/test-targets/${testTargetId}/config?url=https%3A%2F%2FthisIsARealUrl.com&outputDir=%2Ftmp%2Ffoo&environmentId=123-123-123`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    });
  });

  describe(getPlaywrightCode.name, () => {
    const testCode = "";
    const testCaseId = "testId";
    const url = "https://thisIsARealUrl.com";

    beforeEach(() => {
      jest.mocked(axios.get).mockResolvedValue({
        data: { testCode },
      });
    });

    it("fetches the correct code with authentication", async () => {
      await getPlaywrightCode({
        testCaseId,
        token,
        url,
        octomindUrl,
        testTargetId,
        environmentId,
      });

      const searchParams = new URLSearchParams({
        executionUrl: url,
        environmentId,
      });

      expect(axios.get).toHaveBeenCalledWith(
        `https://app.octomind.dev/api/bearer/v1/test-targets/${testTargetId}/test-cases/${testCaseId}/code?${searchParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    });

    it("correctly throws the error", async () => {
      const axiosError = new AxiosError("some error");

      axiosError.response = {
        data: "Internal Server Error",
      } as AxiosResponse;

      jest.mocked(axios.get).mockRejectedValue(axiosError);

      await expect(
        getPlaywrightCode({
          testCaseId,
          token,
          url,
          octomindUrl,
          testTargetId,
        }),
      ).rejects.toMatchInlineSnapshot(
        `[Error: failed to get code from https://app.octomind.dev/api/bearer/v1/test-targets/testTargetId/test-cases/testId/code?executionUrl=https%3A%2F%2FthisIsARealUrl.com: response body: '"Internal Server Error"' statusCode: 'undefined']`,
      );
    });
  });

  describe(getTestCases.name, () => {
    const mockedTestCases = [
      { id: "id1", description: "description1" },
      { id: "id2", description: "description2" },
      { id: "id3", description: "description3" },
    ];

    beforeEach(() => {
      jest.mocked(axios.get).mockResolvedValue({
        data: mockedTestCases,
      });
    });

    it("fetches the correct test cases with authentication", async () => {
      const testCases = await getTestCases({
        token,
        octomindUrl,
        testTargetId,
      });

      expect(axios.get).toHaveBeenCalledWith(
        `https://app.octomind.dev/api/bearer/v1/test-targets/${testTargetId}/test-cases`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { filter: '{"status":"ENABLED"}' },
        },
      );

      expect(testCases).toEqual(mockedTestCases);
    });

    it("correctly throws an error if it ocurs", async () => {
      const axiosError = new AxiosError("some error");

      axiosError.response = {
        data: "Internal Server Error",
      } as AxiosResponse;

      jest.mocked(axios.get).mockRejectedValue(axiosError);

      await expect(
        getTestCases({
          token,
          octomindUrl,
          testTargetId,
        }),
      ).rejects.toMatchInlineSnapshot(
        `[Error: failed to get test-cases from https://app.octomind.dev/api/bearer/v1/test-targets/testTargetId/test-cases: response body: '"Internal Server Error"' statusCode: 'undefined']`,
      );
    });
  });
});
