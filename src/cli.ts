import { getPlaywrightCode, getTestCases, getTestTarget } from "./octomind-api";
import {
  BasicAuth,
  Environment,
  prepareTestRun,
  runTests,
  TestCaseWithCode,
} from "./debugtopus";
import { Command } from "commander";

export type DebugtopusOptions = {
  id?: string;
  testTargetId: string;
  token: string;
  url: string;
  octomindUrl: string;
  environmentId?: string;
};

export const runWithOptions = async (
  options: DebugtopusOptions,
): Promise<void> => {
  const baseApiOptions = {
    testTargetId: options.testTargetId,
    token: options.token,
    url: options.url,
    octomindUrl: options.octomindUrl,
    environmentId: options.environmentId,
  };

  const testTarget = await getTestTarget({
    testTargetId: options.testTargetId,
    token: options.token,
    octomindUrl: options.octomindUrl,
  });

  let basicAuth: BasicAuth | undefined;
  if (testTarget && testTarget.environments) {
    if (options.environmentId) {
      basicAuth = testTarget.environments.find(
        (env: Environment) => env.id === options.environmentId,
      )?.basicAuth;
    } else {
      basicAuth = testTarget.environments.find(
        (env: Environment) => env.type === "DEFAULT",
      )?.basicAuth;
    }
  }

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
    basicAuth,
  });

  await runTests({ ...testRunPreparationResults, runMode: "ui" });
};

export const debugtopus = async (
  commandLine: string[] = process.argv,
): Promise<void> => {
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
    .option(
      "-e, --environmentId <uuid>",
      "id of the environment you want to run against, if not provided will run all test cases against the default environment",
    )
    .requiredOption("-u, --url <url>", "url the tests should run against")
    .requiredOption(
      "-a, --testTargetId <uuid>",
      "id of the test target of the test case",
    )
    .option(
      "-o, --octomindUrl <url>",
      "base url of the octomind api",
      "https://app.octomind.dev",
    )
    .parse(commandLine);

  await runWithOptions(program.opts<DebugtopusOptions>());
};
