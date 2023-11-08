# Acceptance Tests

> Future Farming and Countryside Programme - AHWR Apply Acceptance Tests

This folder contains the acceptance tests for the FFC AHWR apply service components.

The framework is (Cucumber)[https://cucumber.io/] and (webdriver.io)[https://webdriver.io/] based, containerised, expandable and based on the actively maintained webdriver.io Cucumber boilerplate project.

## Requirements

- Docker Desktop 2.2.0.3 (42716) or higher
- Node version 16
  - if you have multiple versions of node, run `nvm use 16` to use version 16 for this alone

# Quick start

Docker is used to create a container for each of selenium-hub, chrome-browser and webdriver-cuke.
* Selenium Hub allows concurrent execution of test cases
* Chrome Browser is the browser specified in the configuration file `wdio.bs.config.js` by default
* Webdriver.io along with Cucumber is this framework that defines the tests.

## How to run the tests

1. Set the root URL for the environment in the environment variable `TEST_ENVIRONMENT_ROOT_URL`

2. If running against localhost, then no need to set `TEST_ENVIRONMENT_ROOT_URL` as it will default to `docker.host.internal:3000`.  Instead make sure the application container is running with `docker-compose up --build` in the root folder of this repository

3. Set the Browserstack credentials in the environment variables `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY`

4. Set the number of Browserstack parallel runs in the environment variable `BROWSERSTACK_PARALLEL_RUNS`

5. From the directory containing the dockerfile run `docker-compose run --rm wdio-cucumber`. This will run an acceptance test against the FFC AHWR apply service. Alternatively, run `./scripts/acceptance` from the root folder of this repository.

6. The test reports will be output to `./html-reports`. Note that WSL users need to run `mkdir -m 777 html-reports`. Read more about report configuration in the [rpii/wdio-hmtl-reporter docs](https://github.com/rpii/wdio-html-reporter)

7. Now you are ready to maintain, extend or write your own features in the `./acceptance/features` directory

## How to write a test

Tests are written in [Gherkin syntax](https://cucumber.io/docs/reference)
that means that you write down what's supposed to happen in a real language. All test files are located in
`./acceptance/features/*` and have the file ending `.feature`. You will already find some test files in that
directory. They should demonstrate, how tests could look like. Just create a new file and write your first
test.

__myFirstTest.feature__
```gherkin
Feature:
    In order to keep my product stable
    As a developer or product manager
    I want to make sure that everything works as expected

Scenario: Check title of website after search
    Given I open the url "http://google.com"
    When I set "WebdriverIO" to the inputfield "#lst-ib"
    And I press "Enter"
    Then I expect that the title is "WebdriverIO - Google Search"

Scenario: Another test
    Given ...

```

This test opens the browser and navigates them to google.com to check if the title contains the search
query after doing a search. As you can see, it is pretty simple and understandable for everyone.

# Using tags

If you want to run only specific tests you can mark your features with tags. These tags will be placed before each feature like so:

```gherkin
@Tag
Feature: ...
```

To run only the tests with specific tag(s) use the `--cucumberOpts.tagExpression=` parameter like so:

```sh
$ npx wdio wdio.bs.config.js --cucumberOpts.tagExpression='@Tag or @AnotherTag'
```

For more tag options please see the [Cucumber.js documentation](https://docs.cucumber.io/tag-expressions/)

# Pending test

If you have failing or unimplemented tests you can mark them as "Pending" so they will get skipped.

```gherkin
// skip whole feature file
@Pending
Feature: ...

// only skip a single scenario
@Pending
Scenario: ...
```

# Adding new steps and snippets

The predefined snippets allow you to do a lot of common things but you might need extra snippets which
are better aligned with your aims. To do so you will find all step definitions in `./acceptance/steps`. 

You define your snippet using regular expressions. This is pretty powerful as it allows you to create complex
sentences with multiple options. Everything that's within `"([^"]*)?"` gets captured and appended to the
callback. The last argument is always a callback function that you need to call when your step is done.
You can access the browser and your WebdriverIO instance with `browser`.

# Comments

You can add additional descriptive comments in your feature files.

```gherkin
###
  This is a
  block comment
###
Feature: As a bystander
    I can watch bottles falling from a wall
    So that I can be mildly amused

# This is a single line comment
Scenario: check if username is present
    Given I login as "roboter" with password "test123"
    Then the username "roboter" should be present in the header
```