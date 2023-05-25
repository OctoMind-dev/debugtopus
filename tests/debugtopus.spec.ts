import { ChildProcess, spawn } from "child_process";
import { chromium } from "@playwright/test";
import { clearTimeout } from "timers";

const killEntireProcessGroup = (child: ChildProcess): void => {
  // kill the entire process group (-pid) to kill the shell as well
  process.kill(-child.pid!);
};

describe("debugtopus", () => {
  it("can connect chromium to a running debugtopus instance", async () => {
    const child = spawn("pnpm start --port=3000", {
      shell: true,
      detached: true,
    });

    let url: string | undefined = undefined;

    //don't leave hanging process in failure cases
    const timer = setTimeout(() => {
      killEntireProcessGroup(child);
    }, 10_000);

    for await (const data of child.stdout) {
      const regex = /"(?<url>wss:\/\/.*)"/;

      console.log(data.toString());

      const match = data.toString().match(regex);

      if (match) {
        url = match.groups?.["url"];
        await expect(chromium.connect(url!)).resolves.toBeTruthy();

        killEntireProcessGroup(child);
      }
    }

    //ensure that match branch was invoked
    expect.assertions(1);

    clearTimeout(timer);
  });
});
