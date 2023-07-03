import { ensureChromiumIsInstalled } from "../src/installation";
import { exec } from "child_process";
import { access, NoParamCallback, PathLike } from "fs";

jest.mock("fs");
jest.mock("child_process", () => {
  return {
    ...jest.requireActual("child_process"),
    exec: jest.fn(async (command, options, callback) => {
      callback(null, "hallo", "zusammen");
    }),
  };
});

type AccessFunction = (
  // eslint-disable-next-line no-unused-vars
  path: PathLike,
  // eslint-disable-next-line no-unused-vars
  mode: number | undefined,
  // eslint-disable-next-line no-unused-vars
  callback: NoParamCallback
) => void;

describe("random describe", () => {
  beforeEach(() => {
    jest.mocked(exec).mockClear();
  });
  it("tries to install browsers if they are missing", async () => {
    jest
      .mocked<AccessFunction>(access)
      .mockImplementation(async (_, __, callback) => {
        // eslint-disable-next-line no-undef
        await callback({ code: "ENOENT" } as NodeJS.ErrnoException);
      });

    await ensureChromiumIsInstalled("randomAssCwd");

    expect(exec).toHaveBeenCalledWith(
      "npx playwright install chromium",
      {
        cwd: "randomAssCwd",
      },
      expect.anything()
    );
  });

  it("resolves browsers already installs", async () => {
    jest
      .mocked<AccessFunction>(access)
      .mockImplementation(async (_, __, callback) => {
        await callback(null);
      });

    await ensureChromiumIsInstalled("whatever");

    expect(exec).toHaveBeenCalledTimes(0);
  });

  it("rejects if error is not ENOENT", async () => {
    // eslint-disable-next-line no-undef
    const aError = { code: "notENOENT" } as NodeJS.ErrnoException;
    jest
      .mocked<AccessFunction>(access)
      .mockImplementation(async (_, __, callback) => {
        await callback(aError);
      });

    await expect(ensureChromiumIsInstalled("whatever")).rejects.toEqual(aError);
  });
});
