import { prepareTestRun } from "../src/debugtopus";
import { createMockOptions, createMockTestPreparationResult } from "./mocks";
import { getPlaywrightCode, getTestCases } from "../src/octomind-api";
import { runWithOptions } from "../src/cli";

jest.mock("../src/debugtopus");
jest.mock("../src/octomind-api");

describe(runWithOptions.name, () => {
  const mockedCode = "code";
  const mockedTestCases = [
    { id: "id1", description: "description1" },
    { id: "id2", description: "description2" },
  ];

  beforeEach(() => {
    jest
      .mocked(prepareTestRun)
      .mockResolvedValue(createMockTestPreparationResult());
    jest.mocked(getPlaywrightCode).mockResolvedValue(mockedCode);
    jest.mocked(getTestCases).mockResolvedValue(mockedTestCases);
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
});
