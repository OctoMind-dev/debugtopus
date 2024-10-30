# debugtopus  🐙 💻

Debugtopus is a tool to run Octomind tests against the local instance of your app. Octomind tests are AI auto-generated, hosted and run end-to-end tests in standard Playwright code in the cloud. 

Here's some more [info](https://www.octomind.dev/?utm_source=github&utm_medium=debugtopus&utm_campaign=rm) on octomind and more in the [docs](https://www.octomind.dev/docs?utm_source=github&utm_medium=debugtopus&utm_campaign=rm).


## Installation

```shell
npm i @octomind/debugtopus
```

## Description

### Required
* `-t, --token <token>` - auth token to authorise against octomind app
* `-tt, --testTargetId <test-target-id>` - ID of the test target you want to run against
* `-u, --url <local-url>` - an url of your app you want the tests to be run against
### Optional
* `-i, --id <test-case-id>` - ID of the test case you want to run locally - if not provided will run all test cases in the specified target
* `-e, --environmentId <environment-id>` - ID of the environment you want your test case to use - if not provided will run all test cases in default environment
* `-o, --octomindUrl <octo-url>` - defaults to production app `app.octomind.dev`. Used by octoneers to test against different environments

## Usage
You should get the base command including id and token from octomind. 
You should just add the url of the app you would like to run the test against:

Running one test case:
```shell
npx @octomind/debugtopus --id <testCaseId> --token <token> --url <localUrl> --testTargetId <testTargetId> --environmentId <environmentId>
```

Running all test cases in a test target:
```shell
npx @octomind/debugtopus --token <token> --url <localUrl> --testTargetId <testTargetId> --environmentId <environmentId>
```

You can also use a specific version:
```shell
 npx --package @octomind/debugtopus@<some-version> debugtopus --id <testCaseId> --token <token> --url <localUrl> --testTargetId <testTargetId> --environmentId <environmentId>
```

## Development

### Dependencies

We use [corepack](https://nodejs.org/api/corepack.html) and [pnpm](https://pnpm.io/) for our dependencies.

Enable corepack to let it manage pnpm and its version for you:

```shell
corepack enable
```

Then any time you reference `pnpm` in your shell corepack will ensure the right version is installed.
