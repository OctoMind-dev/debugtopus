import { chromium } from "@playwright/test";
import ngrok from "ngrok";
import { Command } from "commander";

export const debugtopus = async (): Promise<void> => {
  const program = new Command();

  program
    .option(
      "-p, --port <number>",
      "port on which chromium will be launched",
      (element) => parseInt(element)
    )
    .parse(process.argv);

  const options = program.opts();

  const port = options.port ?? 8888;

  const server = await chromium.launchServer({
    devtools: true,
    port,
  });

  const url = await ngrok.connect(port);

  const reverseProxyPlaywrightWsEndpoint = server
    .wsEndpoint()
    .replace(`ws://127.0.0.1:${port}`, `wss://${url.replace("https://", "")}`);

  // eslint-disable-next-line no-console
  console.log(
    `you can pass "${reverseProxyPlaywrightWsEndpoint}" as the wsEndpoint in order to run automagically against your local environment`
  );
};
