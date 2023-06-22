// eslint-disable-next-line filenames/match-regex
import { ensureChromiumIsInstalled } from "@/debugtopus";
import { exec } from "child_process";
import { access, NoParamCallback, PathLike } from "fs";

jest.mock("fs");
jest.mock("child_process", () => {
  return {
    ...jest.requireActual("util"),
    exec: jest.fn(() => {
      return jest.fn();
    }),
  };
});

type accessFunction = (
  // eslint-disable-next-line no-unused-vars
  path: PathLike,
  // eslint-disable-next-line no-unused-vars
  mode: number | undefined,
  // eslint-disable-next-line no-unused-vars
  callback: NoParamCallback
) => void;

describe("random describe", () => {
  // todo: don't know how to mock dis
  // it("tries to install browsers if they are missing", async () => {
  //   // @ts-ignore
  //   jest.mocked(access).mockImplementation(async (_, __, callback) => {
  //     // eslint-disable-next-line no-undef
  //     await callback({ code: "ENOENT" } as NodeJS.ErrnoException);
  //   });
  //
  //   await ensureChromiumIsInstalled("whatever");
  //
  //   expect(exec).toHaveBeenCalledWith("npx playwright install chromium", {
  //     cwd: "randomAssCwd",
  //   });
  // });

  it("resolves browsers already installs", async () => {
    jest
      .mocked<accessFunction>(access)
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
      .mocked<accessFunction>(access)
      .mockImplementation(async (_, __, callback) => {
        await callback(aError);
      });

    await expect(ensureChromiumIsInstalled("whatever")).rejects.toEqual(aError);
  });
});
