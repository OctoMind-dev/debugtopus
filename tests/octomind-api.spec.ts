import axios, { AxiosError, type AxiosResponse } from "axios";
import { getPlaywrightCode } from "../src/octomind-api";

jest.mock("axios");

describe("octomind-api", () => {
  const testCode = "";
  const testCaseId = "testId";
  const token = "token";
  const octomindUrl = "https://app.octomind.dev";
  const url = "https://thisIsARealUrl.com";

  beforeEach(() => {
    jest.mocked(axios.get).mockResolvedValue({
      data: { testCode },
    });
  });

  it("fetches the correct code with authentication", async () => {
    await getPlaywrightCode({ testCaseId, token, url, octomindUrl });

    expect(axios.get).toHaveBeenCalledWith(
      `https://app.octomind.dev/api/v1/test-cases/${testCaseId}/code?executionUrl=${encodeURI(
        url
      )}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  });

  it("correctly throws the error", async () => {
    const axiosError = new AxiosError("some error");

    axiosError.response = {
      data: "Internal Server Error",
    } as AxiosResponse;

    jest.mocked(axios.get).mockRejectedValue(axiosError);

    await expect(
      getPlaywrightCode({ testCaseId, token, url, octomindUrl })
    ).rejects.toMatchInlineSnapshot(
      `[Error: failed to get code from https://app.octomind.dev/api/v1/test-cases/testId/code?executionUrl=https://thisIsARealUrl.com: "Internal Server Error"]`
    );
  });
});
