import { ensureBrowsersAreInstalled } from "../src/installation";
// noinspection ES6UnusedImports
import { exec } from "child_process";
import { access, NoParamCallback, PathLike } from "fs";
import fs from "fs/promises";
import fsPromises from "fs/promises";

jest.mock("fs/promises");
jest.mock("child_process", () => {
  return {
    ...jest.requireActual("child_process"),
    exec: jest.fn(async (command, options, callback) => {
      callback(null, "hallo", "zusammen");
    }),
  };
});

describe("random describe", () => {
  it("tries to install browsers if they are missing", async () => {
    jest.mocked(fsPromises.access).mockImplementation(async () => {
      const error = new Error("ENOENT");
      throw error;
    });

    await ensureBrowsersAreInstalled("randomAssCwd");

    expect(exec).toHaveBeenCalledWith(
      "npx playwright install",
      {
        cwd: "randomAssCwd",
      },
      expect.anything(),
    );
  });

  it("resolves if browsers already installs", async () => {
    jest.mocked(fsPromises.access).mockResolvedValue(undefined);

    await ensureBrowsersAreInstalled("whatever");

    expect(exec).toHaveBeenCalledTimes(0);
  });
});
