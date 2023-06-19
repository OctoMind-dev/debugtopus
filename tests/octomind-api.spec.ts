import axios, { AxiosError, type AxiosResponse } from "axios";
import { getPlaywrightCode } from "@/octomind-api";

jest.mock("axios");

describe("octomind-api", () => {
  const testCode = "";
  const testId = "testId";
  const token = "token";
  const octomindUrl = "https://app.octomind.dev";
  const url = "https://foo.bar";

  beforeEach(() => {
    jest.mocked(axios.get).mockResolvedValue({
      data: { testCode },
    });
  });

  it("fetches the correct code with authentication", async () => {
    await getPlaywrightCode(testId, token, url, octomindUrl);

    expect(axios.get).toHaveBeenCalledWith(
      `https://app.octomind.dev/api/v1/test-cases/${testId}/code?executionUrl=${encodeURI(
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
      getPlaywrightCode(testId, token, url, octomindUrl)
    ).rejects.toMatchInlineSnapshot(
      `[Error: failed to get code from https://app.octomind.dev/api/v1/test-cases/testId/code?executionUrl=https://foo.bar: "Internal Server Error"]`
    );
  });
});
