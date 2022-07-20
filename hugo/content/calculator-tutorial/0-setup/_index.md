---
title: "Setup Langium"
weight: 300
---

* [ ] Open VSCode in your prefered working directory, I will call it `<cwd>` from now on.
* [ ] Open a terminal and install Yeoman and the Langium generator with `npm i -g yo generator-langium`
* [ ] Run Langium's generator with `yo langium`. Three questions are following.
    * [ ] I chosed the ***extension name*** `ErrorMathTutorial`.
    * [ ] I chosed the ***language name*** `Error Math`.
    * [ ] I chosed the ***file extensions*** `.errmath`.
    * [ ] Make sure that a folder `ErrorMathTutorial` was created
* [ ] Move that folder one up to your `<cwd>` with `mv ErrorMathTutorial/* .`. This is done because you normally want to have the `package.json` in your root folder.

* [ ] npm i
* [ ] F5 to run the extension
