import axios from "axios";

export const getPlaywrightCode = async (
  testCaseId: string,
  token: string,
  url: string
): Promise<string> => {
  const endpoint = `http://localhost:3000/api/v1/test-cases/${testCaseId}/code?url=${encodeURI(
    url
  )}`;
  try {
    const axiosResponse = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return axiosResponse.data.testCode;
  } catch (error) {
    throw new Error(`failed to get code from ${endpoint}`);
  }
};
