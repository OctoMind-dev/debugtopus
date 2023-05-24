# debugtopus  🐙💻

Thin wrapper around ngrok and playwright to run your automagically-maintained tests locally.

## Installation

```shell
npm i @octomind/debugtopus
```

## Usage
Typing the following, where `port` defaults to `8888`:

```shell
$ npx debugtopus --port
```

Will output `you can pass "wss://<some-url>" as the wsEndpoint to /execute in order to run automagically against your local environment`

