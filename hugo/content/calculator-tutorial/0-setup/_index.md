---
title: "Setup Langium"
weight: 300
---

## Start with Yeoman

* [ ] Open VSCode in your prefered working directory, I will call it `<cwd>` from now on.
* [ ] Open a terminal and install Yeoman and the Langium generator with `npm i -g yo generator-langium`
* [ ] Run Langium's generator with `yo langium`. Three questions are following.
    * [ ] I chosed the ***extension name*** `ErrorMathTutorial`.
    * [ ] I chosed the ***language name*** `Error Math`.
    * [ ] I chosed the ***file extensions*** `.errmath`.
    * [ ] Make sure that a folder `ErrorMathTutorial` was created
* [ ] Move that folder one up to your `<cwd>` with `mv ErrorMathTutorial/* .`. This is done because you normally want to have the `package.json` in your root folder.

## Know your files

* [ ] You will have the following folder structure:
  ```plain
  |- .vscode                    --VSCode settings including an extension setup
  |- bin                        --executables like the CLI below
  |- node_modules               --node dependecies
  |- out                        --build files
  |- src
  |  |- cli                     --command line tool, to invoke compiler manually
  |  |- language-server         --LSP server
  |  |  |- error-math.langium   --Grammar file
  |  |  |- ...
  |  |- extension.ts            --VSCode extension
  |- syntaxes                   --TextMate files for syntax highlighting
  ```

## Know your scripts
* [ ] go to your terminal in the `<cwd>` and execute `npm run langium:generate`, each time you have changed the grammar file or `npm run langium:watch` if the computer shall watch and compile on a change automatically. The last lines should contain `Langium generator finished successfully`.
* [ ] go to your terminal in `<cwd>` and execute `npm run build`, each time you have changed a source file. This is done automatically when running `npm run watch` instead.

## Know your grammar
* [ ] open the grammar file at `src/language-server/error-math.langium`
    ```plain
    grammar ErrorMath                                // name of your grammar
                                                     // start of parser rules
    entry Model:                                     // entry rule, your compiler will start from here
        (persons+=Person | greetings+=Greeting)*;    // a mixed list of persons and greetings

    Person:                                          // persons are declared using a 'person' keyword
        'person' name=ID;                            // followed by their name   

    Greeting:                                        // greetings are using a cross-reference to a
        'Hello' person=[Person:ID] '!';              // declared person
                                                     // end of parser, begin of terminal rules
    hidden terminal WS: /\s+/;                       // ignore whitespace with 'hidden'
    terminal ID: /[_a-zA-Z][\w_]*/;                  // identifiers
    terminal INT returns number: /[0-9]+/;           // number literals, not used here
    terminal STRING: /"[^"]*"|'[^']*'/;              // string literals, not used here

    hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;  // hidden multi and single line comments
    hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
    ```

## Run your language editor
* [ ] by hitting `F5` you can run the VSCode extension of your language
* [ ] create a `.errmath` file and insert something like
  ```
  person Mario
  Hello Mario!
  ```
  Here we declare a person `Mario` in the first line and greet him in the second line. If you change the name in the second line, you will get a reference error, since there is no person with that name.
