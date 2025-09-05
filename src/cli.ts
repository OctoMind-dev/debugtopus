import {
  getPlaywrightConfig,
  getPlaywrightCode,
  getTestCases,
  getTestTarget,
} from "./octomind-api";
import {
  Environment,
  prepareDirectories,
  runTests,
  TestCaseWithCode,
  writeConfigAndTests,
} from "./debugtopus";
import { Command, Option } from "commander";

export type DebugtopusOptions = {
  id?: string;
  testTargetId: string;
  breakpoint: "DESKTOP" | "TABLET" | "MOBILE";
  browser: "CHROMIUM" | "FIREFOX" | "SAFARI";
  token: string;
  url: string;
  octomindUrl: string;
  environmentId?: string;
  headless?: boolean;
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

  const environmentIdForConfig = options.environmentId
    ? options.environmentId
    : testTarget.environments.find((env: Environment) => env.type === "DEFAULT")
        .id;

  const dirs = await prepareDirectories();

  const config = await getPlaywrightConfig({
    testTargetId: options.testTargetId,
    token: options.token,
    octomindUrl: options.octomindUrl,
    url: options.url,
    outputDir: dirs.outputDir,
    environmentId: environmentIdForConfig!,
    headless: options.headless,
    browser: options.browser,
    breakpoint: options.breakpoint,
  });

  writeConfigAndTests({
    testCasesWithCode,
    config,
    dirs,
  });
  await runTests({ ...dirs, runMode: options.headless ? "headless" : "ui" });
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
    .option(
      "--headless",
      "if we should run headless without the UI of playwright and the browser",
    )
    .addOption(
      new Option("-b, --browser <browser>", "browser to use")
        .choices(["CHROMIUM", "FIREFOX", "SAFARI"])
        .default("CHROMIUM"),
    )
    .addOption(
      new Option("-d, --breakpoint <breakpoint>", "breakpoint to use")
        .choices(["DESKTOP", "TABLET", "MOBILE"])
        .default("DESKTOP"),
    )
    .parse(commandLine);

  await runWithOptions(program.opts<DebugtopusOptions>());
};
