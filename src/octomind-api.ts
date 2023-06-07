import axios, { AxiosError } from "axios";

export const getPlaywrightCode = async (
  testCaseId: string,
  token: string,
  url: string,
  octomindUrl: string
): Promise<string> => {
  const endpoint = `${octomindUrl}/api/v1/test-cases/${testCaseId}/code?executionUrl=${encodeURI(
    url
  )}`;
  try {
    const axiosResponse = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return axiosResponse.data.testCode;
  } catch (error) {
    const responseBody = (error as AxiosError).response?.data;
    throw new Error(`failed to get code from ${endpoint}: ${responseBody}`);
  }
};
