#!/usr/bin/env node
import {chromium} from 'playwright'
import ngrok from 'ngrok'
import {Command} from 'commander'

const main = async (): Promise<void> => {
  const program = new Command()

  program
    .option(
      '-p, --port <number>',
      'port on which chromium will be launched',
      element => parseInt(element)
    )
    // eslint-disable-next-line no-undef
    .parse(process.argv)

  const options = program.opts()

  const port = options.port ?? 8888
  const server = await chromium.launchServer({
    devtools: true,
    port
  })

  const url = await ngrok.connect(port)

  const reverseProxyPlaywrightWsEndpoint = server
    .wsEndpoint()
    .replace(`ws://127.0.0.1:${port}`, `wss://${url.replace('https://', '')}`)

  // eslint-disable-next-line no-undef,no-console
  console.log(
    `you can pass "${reverseProxyPlaywrightWsEndpoint}" as the wsEndpoint to /execute in order to run automagically against your local environment`
  )
}

await main()
