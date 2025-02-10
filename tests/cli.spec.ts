import { prepareTestRun } from "../src/debugtopus";
import { createMockOptions, createMockTestPreparationResult } from "./mocks";
import { getPlaywrightCode, getTestCases, getTestTarget } from "../src/octomind-api";
import { debugtopus, DebugtopusOptions, runWithOptions } from "../src/cli";
import { Command } from "commander";

jest.mock("../src/debugtopus");
jest.mock("../src/octomind-api");
jest.mock("commander");

describe(runWithOptions.name, () => {
  const mockedCode = "code";
  const mockedTestCases = [
    { id: "id1", description: "description1" },
    { id: "id2", description: "description2" },
  ];

  const requiredOptions: Required<DebugtopusOptions> = {
    environmentId: "environmentId",
    id: "testCaseId",
    octomindUrl: "octomindUrl",
    testTargetId: "testTargetId",
    token: "token",
    url: "https://url.com",
    proxy: "proxy",
  };

  const mockedTestTarget = {
    environments: [
      {
        id: "environmentId",
        type: "DEFAULT",
        basicAuth: {
          username: "username",
          password: "password",
        },
      },
    ],
  };

  beforeEach(() => {
    jest
      .mocked(prepareTestRun)
      .mockResolvedValue(createMockTestPreparationResult());
    jest.mocked(getPlaywrightCode).mockResolvedValue(mockedCode);
    jest.mocked(getTestCases).mockResolvedValue(mockedTestCases);
    jest.mocked(getTestTarget).mockResolvedValue(mockedTestTarget);
  });

  it("correctly runs one test if id is included", async () => {
    const id = "someId";
    await runWithOptions(
      createMockOptions({
        id,
      }),
    );

    expect(prepareTestRun).toHaveBeenCalledWith(
      expect.objectContaining({
        basicAuth: mockedTestTarget.environments[0].basicAuth,
      }),
    );

    expect(prepareTestRun).toHaveBeenCalledWith(
      expect.objectContaining({
        testCasesWithCode: [
          {
            id,
            code: mockedCode,
          },
        ],
      }),
    );
  });

  it("correctly runs all tests if no id is included", async () => {
    await runWithOptions(
      createMockOptions({
        id: undefined,
      }),
    );

    expect(prepareTestRun).toHaveBeenCalledWith(
      expect.objectContaining({
        testCasesWithCode: mockedTestCases.map((tc) => ({
          code: mockedCode,
          ...tc,
        })),
      }),
    );
  });

  describe("commandline", () => {
    let mockedOption: jest.Mock;
    let mockedRequiredOption: jest.Mock;

    beforeEach(() => {
      mockedOption = jest.fn().mockReturnThis();
      mockedRequiredOption = jest.fn().mockReturnThis();

      jest.mocked(Command).mockReturnValue({
        option: mockedOption,
        requiredOption: mockedRequiredOption,
        parse: jest.fn().mockReturnThis(),
        opts: jest.fn().mockReturnValue(requiredOptions),
      } as Partial<Command> as Command);
    });

    it.each(Object.entries(requiredOptions))(
      "should include required option '%s' in the cli-api",
      async (entry) => {
        // const expectedCommandline = `--${option} ${optionValue}`;

        await debugtopus(["npx", "@octomind/debugtopus", "--help"]);

        const calls = [
          ...mockedOption.mock.calls,
          ...mockedRequiredOption.mock.calls,
        ];

        let expectedThirdArgument = undefined;

        if (entry === "octomindUrl" || entry === "proxy") {
          expectedThirdArgument = expect.any(String);
        }

        expect(calls).toContainEqual([
          expect.stringContaining(`--${entry}`),
          expect.any(String),
          expectedThirdArgument,
        ]);
      },
    );
  });
});
