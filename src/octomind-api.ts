import axios, { AxiosError } from "axios";

export const getPlaywrightCode = async ({
  testCaseId,
  token,
  url,
  octomindUrl,
}: {
  testCaseId: string;
  token: string;
  url: string;
  octomindUrl: string;
}): Promise<string> => {
  const endpoint = `${octomindUrl}/api/bearer/v1/test-cases/${testCaseId}/code?executionUrl=${encodeURI(
    url,
  )}`;
  try {
    const axiosResponse = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return axiosResponse.data.testCode;
  } catch (error) {
    const responseBody = (error as AxiosError).response?.data;
    const responseCode = (error as AxiosError).response?.status;
    throw new Error(
      `failed to get code from ${endpoint}: response body: '${JSON.stringify(
        responseBody,
      )}' statusCode: '${JSON.stringify(responseCode)}'`,
    );
  }
};
