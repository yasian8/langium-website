---
title: "Mission"
weight: 0
---

Imagine that we are studying physics. We are visiting a course for experimental physics. In each session we do a experiment, whose outcome is a report or protocol. Part of that report is the calculation of the results whose input variables are erroneous.

So, you cannot just calculate a single result, you also have to make a statement about the effects of the input errors on the result.

There are several, but simple rules, we have to keep in mind:

* an input value v has an ***absolute error*** &Delta;v, denoted as v&pm;&Delta;v.

   ***Example***: Like if you read a distance from your ruler, this could be 5&pm;0.2 cm.

* despite from a ruler measurement error, there also exists tools with a ***relative error*** in %. The error is then proportional to the value.

  ***Example***: You have a voltmeter for measuring the voltage of a circuit. The voltmeter has a relative error of 1%. If you measure a voltage of 20V your absolute error is 1% of 20 V which is 0.2 V.

* when you add two erroneous values a and b, the result a+b has an absolute error of &Delta;a+&Delta;b (***absollute error of a sum of values is equal to the sum of all absolute errors***). BUT subtraction also adds the errors.

  ***Examples***:

  * 5&pm;0.2 cm + 100&pm;3 cm = 105&pm;3.2 cm
  * 5&pm;0.2 cm - 100&pm;3 cm = -95&pm;3.2 cm

* when you multiply two erroneous values a and b, the result a x b has a relative error (!) of &Delta;a/a+&Delta;b/b (***relative error of a product of values is equal to the sum of all relative errors***). BUT division also adds relative errors.

  Examples:

  * 100&pm;3 cm * 5&pm;1 cm = 100&pm;3% * 5&pm;20% cm = 500&pm;23% cm = 500&pm;115 cm
  * 100&pm;3 cm / 5&pm;1 cm = 100&pm;3% / 5&pm;20% cm = 20&pm;23% cm = 20&pm;4.6 cm

The task is to ***create a language*** to calculate the result including the errors and to print a ***report that contains all side calculations***.