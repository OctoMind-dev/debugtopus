import axios, { AxiosError } from "axios";

export const getPlaywrightConfig = async ({
  testTargetId,
  token,
  octomindUrl,
  outputDir,
  url,
  environmentId,
  headless,
}: {
  testTargetId: string;
  token: string;
  octomindUrl: string;
  outputDir: string;
  url: string;
  environmentId: string;
  headless?: boolean;
}): Promise<string> => {
  const searchParams = new URLSearchParams();
  searchParams.set("url", url);
  searchParams.set("outputDir", outputDir);
  searchParams.set("environmentId", environmentId);
  if (headless) {
    searchParams.set("headless", String(headless));
  }

  const endpoint = `${octomindUrl}/api/bearer/v1/test-targets/${testTargetId}/config?${searchParams.toString()}`;

  try {
    const axiosResponse = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return axiosResponse.data;
  } catch (error) {
    const responseBody = (error as AxiosError).response?.data;
    const responseCode = (error as AxiosError).response?.status;
    throw new Error(
      `failed to get config from ${endpoint}: response body: '${JSON.stringify(
        responseBody,
      )}' statusCode: '${JSON.stringify(responseCode)}'`,
    );
  }
};

export const getPlaywrightCode = async ({
  testCaseId,
  token,
  url,
  octomindUrl,
  testTargetId,
  environmentId,
}: {
  testCaseId: string;
  testTargetId: string;
  token: string;
  url: string;
  octomindUrl: string;
  environmentId?: string;
}): Promise<string> => {
  const searchParams = new URLSearchParams();

  searchParams.set("executionUrl", url);
  if (environmentId) {
    searchParams.set("environmentId", environmentId);
  }

  const endpoint = `${octomindUrl}/api/bearer/v1/test-targets/${testTargetId}/test-cases/${testCaseId}/code?${searchParams.toString()}`;

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

export const getTestTarget = async ({
  testTargetId,
  token,
  octomindUrl,
}: {
  testTargetId: string;
  token: string;
  octomindUrl: string;
}): Promise<any> => {
  const endpoint = `${octomindUrl}/api/bearer/v1/test-targets/${testTargetId}`;
  try {
    const axiosResponse = await axios.get<[TestCase]>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return axiosResponse.data;
  } catch (error) {
    const responseBody = (error as AxiosError).response?.data;
    const responseCode = (error as AxiosError).response?.status;
    throw new Error(
      `failed to get test-target from ${endpoint}: response body: '${JSON.stringify(
        responseBody,
      )}' statusCode: '${JSON.stringify(responseCode)}'`,
    );
  }
};

export type TestCase = { id: string; description?: string };

export const getTestCases = async ({
  token,
  octomindUrl,
  testTargetId,
}: {
  testTargetId: string;
  token: string;
  octomindUrl: string;
}): Promise<TestCase[]> => {
  const endpoint = `${octomindUrl}/api/bearer/v1/test-targets/${testTargetId}/test-cases`;
  try {
    const axiosResponse = await axios.get<[TestCase]>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      params: { filter: JSON.stringify({ status: "ENABLED" }) },
    });
    return axiosResponse.data;
  } catch (error) {
    const responseBody = (error as AxiosError).response?.data;
    const responseCode = (error as AxiosError).response?.status;
    throw new Error(
      `failed to get test-cases from ${endpoint}: response body: '${JSON.stringify(
        responseBody,
      )}' statusCode: '${JSON.stringify(responseCode)}'`,
    );
  }
};
