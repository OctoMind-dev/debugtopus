# debugtopus  🐙 💻

Hey! We use AI agent to auto-generate, host and run AI-generated end-to-end tests in standard Playwright code in the cloud. We work on both staging and production, as long as we can access the website. 

Whether you want to make sure you didn't break a new build or use the e2e tests for synthetic monitoring, we offer a fast and easy way to QA your web app. Here some [info](https://www.octomind.dev/?utm_source=github&utm_medium=debugtopus&utm_campaign=rm) on that and more in the [docs](https://www.octomind.dev/docs?utm_source=github&utm_medium=debugtopus&utm_campaign=rm).

We created Debugtopus to help you pinpoint the bug if a test goes red. It's a tool to run Octomind tests against a local instance of your app.

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
* `-o, --octomindUrl <octo-url>` - defaults to production app `app.octomind.dev`. Used by octoneers to test against different environments

## Usage
You should get the base command including id and token from octomind. 
You should just add the url of the app you would like to run the test against:

Running one test case:
```shell
npx @octomind/debugtopus --id <test-case-id> --token <token> --url <local-url> --testTargetid <testTargetid>
```

Running all test cases in a test target:
```shell
npx @octomind/debugtopus --token <token> --url <local-url> --testTargetid <testTargetid>
```

You can also use a specific version:
```shell
 npx --package @octomind/debugtopus@<some-version> debugtopus --id <test-case-id> --token <token> --url <local-url> --testTargetid <testTargetid>
```

## Development

### Dependencies

We use [corepack](https://nodejs.org/api/corepack.html) and [pnpm](https://pnpm.io/) for our dependencies.

Enable corepack to let it manage pnpm and its version for you:

```shell
corepack enable
```

Then any time you reference `pnpm` in your shell corepack will ensure the right version is installed.
