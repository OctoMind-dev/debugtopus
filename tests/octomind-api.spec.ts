import axios, { AxiosError, type AxiosResponse } from "axios";
import { getPlaywrightCode } from "../src/octomind-api";

jest.mock("axios");

describe("octomind-api", () => {
  const testCode = "";
  const testCaseId = "testId";
  const testTargetId = "testTargetId";
  const token = "token";
  const octomindUrl = "https://app.octomind.dev";
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
    });

    expect(axios.get).toHaveBeenCalledWith(
      `https://app.octomind.dev/api/bearer/v1/test-targets/${testTargetId}/test-cases/${testCaseId}/code?executionUrl=${encodeURI(
        url,
      )}`,
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
      getPlaywrightCode({ testCaseId, token, url, octomindUrl, testTargetId }),
    ).rejects.toMatchInlineSnapshot(
      `[Error: failed to get code from https://app.octomind.dev/api/bearer/v1/test-targets/testTargetId/test-cases/testId/code?executionUrl=https://thisIsARealUrl.com: response body: '"Internal Server Error"' statusCode: 'undefined']`,
    );
  });
});
