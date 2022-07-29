---
title: "Adding a test framework"
weight: 400
---

## Prerequisites

Finish the [Langium setup](/calculator-tutorial/0-setup) or start from [here](TODO link to a repo path or branch).

## Reminder

We already have learned, that:

* we can run `npm run langium:generate` or `npm run langium:watch` to generate the abstract syntax tree (AST)
* we can run `npm run build` or `npm run watch` to generate Javascript files

## Goal

In this tutorial, we will add a testing environment. Tests are useful, because the verification time of your changes becomes shorter. 

## Adding a test framework

I will use Jest together with Expect.

* [ ] please install these packages `npm install jest jest-expect-message ts-jest @types/jest @types/jest-expect-message`. The names are self-explaining.
* [ ] create a folder `test` in the root directory, here we will store our tests
* [ ] add a `jest.config.json` file to the root directory, with the following content:
    ```json
    {
        "preset": "ts-jest",
        "roots": [
            "<rootDir>/test"
        ],
        "collectCoverageFrom": ["src/**/{!(generated),}/*"],
        "testEnvironment": "node",
        "setupFilesAfterEnv": ["jest-expect-message"]
    }
    ```
* [ ] add a script into your `package.json`
    ```json
    "test": "jest --coverage"
    ```
* [ ] add a dummy test into the `test` folder and run `npm test`
    ```typescript
    import 'jest-expect-message';

    describe('Dummy', () => {
        it('should work', () => {
            expect(true).toBeTruthy();
        });
    });
    ```
* [ ] the test should pass