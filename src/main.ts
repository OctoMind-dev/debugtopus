import {chromium} from 'playwright'
import ngrok from 'ngrok'
import {program} from 'commander'

program.option('--port')
program.parse()

const main = async (): Promise<void> => {
  const port = 8888
  const server = await chromium.launchServer({
    devtools: true,
    port: port
  })

  const url = await ngrok.connect(port)

  const reverseProxyPlaywrightWsEndpoint = server
    .wsEndpoint()
    .replace(`ws://127.0.0.1:${port}`, `wss://${url.replace('https://', '')}`)

  console.log(reverseProxyPlaywrightWsEndpoint)
}

await main()
