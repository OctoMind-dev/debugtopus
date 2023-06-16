# debugtopus  🐙💻

Tool to run your octomind tests against a local instance of your app.

## Installation

```shell
npm i @octomind/debugtopus
```

## Description

### Required
* `-i, --id <test-case-id>` - ID of the test case you want to run locally
* `-t, --token <token>` - auth token to authorise against octomind app
* `-u, --url <local-url>` - an url of your app you want the tests to be run against
### Optional
* `-o, --octomindUrl <octo-url>` - defaults to production app `app.octomind.dev`. Used by octoneers to test against different environments

## Usage
You should get the base command including id and token from octomind. 
You should just add the url of the app you would like to run the test against:

```shell
npx @octomind/debugtopus --id <test-case-id> --token <token> --url <local-url>
```
You can also use specific version:
```shell
 npx --package @octomind/debugtopus@<some-version> debugtopus --id <test-case-id> --token <token> --url <local-url>
```