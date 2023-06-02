# debugtopus  🐙💻

Thin wrapper around ngrok and playwright to run your automagically-maintained tests locally.

## Installation

```shell
npm i @octomind/debugtopus
```

## Usage
You should get the base command including id and token from octomind. You should just add the url of the app you would like to run the test against:

```shell
npx debugtopus --id=<test-case-id> --token <token> --url local-url
```
