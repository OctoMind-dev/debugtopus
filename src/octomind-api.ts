import axios from "axios";

export const getPlaywrightCode = async (
  testCaseId: string,
  token: string
): Promise<string> => {
  const axiosResponse = await axios.get(
    `https://api.octomind.dev/test-cases/${testCaseId}/code`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return axiosResponse.data.playwrightCode;
};
