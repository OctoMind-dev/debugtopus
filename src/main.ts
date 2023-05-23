import {chromium} from 'playwright'
import ngrok from 'ngrok'
import {program} from 'commander'

program.option('--port')
program.parse()
program.help()

const main = async (): Promise<void> => {
  const port = 8888
  const server = await chromium.launchServer({
    devtools: true,
    port
  })

  const url = await ngrok.connect(port)

  const reverseProxyPlaywrightWsEndpoint = server
    .wsEndpoint()
    .replace(`ws://127.0.0.1:${port}`, `wss://${url.replace('https://', '')}`)

  console.log(
    `you can pass "${reverseProxyPlaywrightWsEndpoint}" as wsEndpoint to /execute in order to run automagically against local environment`
  )
}

await main()
