---
title: "Testing the document builder"
weight: 600
---

## Prerequisites

Finish the ['Adding a test framework'](/calculator-tutorial/1-test-framework) lesson or start from [here](TODO link to a repo path or branch)..

Finishing ['Understanding dependency injection'](/calculator-tutorial/2-dependency-injection) is optional, but recommended if you need to understand Langium's dependency injection framework.

## Goal

In this lesson, we test Langium's document builder which will do the job of a compiler, simply put.

* convert the text into tokens
  * the input string `person Mario\nHello Mario!`
  * becomes `[(KEYWORD, 'person'), (ID, 'Mario'), (KEYWORD, 'Hello'), (ID, 'Mario'), (KEYWORD, '!')]`)
* convert the token stream into an AST
  * becomes
    ```js
    {
        persons: [{name: 'Mario'}]
        greetings: [{
            person: {
                ref: undefined
            }
        }]
    }
    ```
* index all symbols and compute scopes
* linking the right AST nodes to open cross-references
  * becomes
    ```js
    {
        persons: [{name: 'Mario'}]
        greetings: [{
            person: {
                ref: //links to the {name: 'Mario'} entry above 
            }
        }]
    }
    ```
* validate the AST (reports errors and warnings)

You put in a string and get out the entire abstract syntax tree (AST) for that string.


