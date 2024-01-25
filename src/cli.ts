import { getPlaywrightCode, getTestCases } from "./octomind-api";
import { prepareTestRun, runTests, TestCaseWithCode } from "./debugtopus";
import { Command } from "commander";

export type DebugtopusOptions = {
  id?: string;
  testTargetId: string;
  token: string;
  url: string;
  octomindUrl: string;
};

export const runWithOptions = async (
  options: DebugtopusOptions,
): Promise<void> => {
  const baseApiOptions = {
    testTargetId: options.testTargetId,
    token: options.token,
    url: options.url,
    octomindUrl: options.octomindUrl,
  };

  let testCasesWithCode: TestCaseWithCode[] = [];
  if (options.id) {
    testCasesWithCode = [
      {
        id: options.id,
        code: await getPlaywrightCode({
          testCaseId: options.id,
          ...baseApiOptions,
        }),
      },
    ];
  } else {
    const testCases = await getTestCases(baseApiOptions);

    testCasesWithCode = await Promise.all(
      testCases.map(async (testCase) => ({
        code: await getPlaywrightCode({
          testCaseId: testCase.id,
          ...baseApiOptions,
        }),
        ...testCase,
      })),
    );
  }

  const testRunPreparationResults = await prepareTestRun({
    url: options.url,
    testCasesWithCode,
  });

  await runTests({ ...testRunPreparationResults, runMode: "ui" });
};

export const debugtopus = async (): Promise<void> => {
  const program = new Command();

  program
    .requiredOption(
      "-t, --token <string>",
      "token to authenticate against octomind api",
    )
    .option(
      "-i, --id <uuid>",
      "id of the test case you want to run, if not provided will run all test cases in the test target",
    )
    .requiredOption("-u, --url <url>", "url the tests should run against")
    .requiredOption(
      "-tt, --testTargetId <uuid>",
      "id of the test target of the test case",
    )
    .option(
      "-o, --octomindUrl <url>",
      "base url of the octomind api",
      "https://app.octomind.dev",
    )
    .parse(process.argv);

  await runWithOptions(program.opts<DebugtopusOptions>());
};
