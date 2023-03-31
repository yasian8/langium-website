---
title: "Semantic Model Inference"
weight: 200
---

When AST nodes are created during the parsing of a document, they are given a type. The language grammar dictates the shape of those types and how they might be related to each other. All types form the *semantic model* of your language. There are two ways by which Langium derives semantic model types from the grammar, by **[inference](#inferred-types)** and by **[declaration](#declared-types)**.

*Inference* is the default behavior in Langium. During the generation of the semantic model types, Langium infers the possible types directly from the grammar rules. While this is a powerful approach for simple languages and prototypes, it is not recommended for more mature languages since minimal changes in the grammar can easily lead to breaking changes.

To minimize the chance of breaking changes, Langium introduces *declared types* where the semantic model types are explicitly defined by the user in the grammar via a *TypeScript-like* syntax.

In the following, we detail how grammar rules shape the semantic model via inference and declaration.

## Inferred Types
*Inferred types* result from letting Langium infer the types of the nodes from the grammar rules. Let's have a look at how various rules shape these type definitions:

### Parser Rules
The simplest way to write a parser rule is as follows:
```langium
X: name=ID;
```
With this syntax, Langium will **infer** the type of the node to be generated when parsing the rule. By convention, the type of the node will be named after the name of the rule, resulting in this **TypeScript interface** in the semantic model:
```ts
interface X extends AstNode {
    name: string
}
```
It is also possible to control the naming of the interface by using the following syntax:
```langium
X infers MyType: name=ID;
```
resulting in the following interface in the semantic model:
```ts
interface MyType extends AstNode {
    name: string
}
```
Please note that an `interface X` is no longer present in the semantic model.

It is important to understand that the name of the parser rule and the name of the type it infers work on two separate abstraction levels. The name of the parser rule is used at the *parsing level* where types are ignored and only the parsing rule is considered, while the name of the type is used at the *types level* where both the type and the parser rule play a role. This means that the name of the type can be changed without affecting the parsing rules hierarchy, and that the name of the rule can be changed - if it explicitly infers or returns a given type - without affecting the semantic model.

By inferring types within the grammar, it is also possible to define several parser rules creating the same semantic model type. For example, the following grammar has two rules `X` and `Y` inferring a single semantic model type `MyType`:
```langium
X infers MyType: name=ID;
Y infers MyType: name=ID count=INT;
```
This result in the creation of a single interface in the semantic model 'merging' the two parser rules with non-common properties made optional:
```ts
interface MyType extends AstNode {
    count?: number
    name: string
}
```

### Terminal Rules
Terminal rules are linked to built-in types in the semantic model. They do not result in semantic model types on their own but determine the type of properties in semantic model types inferred from a parser rule:
```langium
terminal INT returns number: /[0-9]+/;
terminal ID returns string: /[a-zA-Z_][a-zA-Z0-9_]*/;

X: name=ID count=INT;
```

```ts
// generated interface
interface X extends AstNode {
    name: string
    count: number
}
```

The property `name` is of type `string` because the terminal rule `ID` is linked to the built-in type `string`, and the property `count` is of type `number` because the terminal rule `INT` is linked to the built-in type `number`.

### Data type rules
Data type rules are similar to terminal rules in the sense that they determine the type of properties in semantic model types inferred from parser rules. However, they lead to the creation of type aliases for built-in types in the semantic model:
```langium
QualifiedName returns string: ID '.' ID;

X: name=QualifiedName;
```

```ts
// generated types
type QualifiedName = string;

interface X extends AstNode {
    name: string
}
```

### Assignments
There are three available kinds of [assignments](../grammar-language/#assignments) in a parser rule:

1. `=` for assigning a **single value** to a property, resulting in the property's type to be derived from the right hand side of the assignment.
2. `+=` for assigning **multiple values** to a property, resulting in the property's type to be an array of the right hand side of the assignment.
3. `?=` for assigning a **boolean** to a property, resulting in the property's type to be a `boolean`.

```langium
X: name=ID numbers+=INT (numbers+=INT)* isValid?='valid'?;
```

```ts
// generated interface
interface X extends AstNode {
    name: string
    numbers: Array<number>
    isValid: boolean
}
```

The right-hand side of an assignment can be any of the following:
* A terminal rule or a data type rule, which results in the type of the property to be a built-in type.
* A parser rule, which results in the type of the property to be the type of the parser rule.
* A cross-reference, which results in the type of the property to be a *Reference* to the type of the cross-reference.
* An alternative, which results in the type of the property to be a type union of all the types in the alternative.

```langium
X: 'x' name=ID;

Y: crossValue=[X:ID] alt=(INT | X | [X:ID]);
```

```ts
// generated types
interface X extends AstNode {
    name: string
}

interface Y extends AstNode {
    crossValue: Reference<X>
    alt: number | X | Reference<X>
}
```

### Unassigned Rule Calls

A parser rule does not necessarily need to have assignments. It may also contain only *unassigned rule calls*. These kind of rules can be used to change the types' hierarchy.

```langium
X: A | B;

A: 'A' name=ID;
B: 'B' name=ID count=INT;

```

```ts
// generated types
type X = A | B;

interface A extends AstNode {
    name: string
}

interface B extends AstNode {
    name: string
    count: number
}
```

### Simple Actions

Actions can be used to change the type of a node **inside** of a parser rule to another semantic model type. For example, they allow you to simplify parser rules which would have to be split into multiple rules.

```langium
X: 
    {infer A} 'A' name=ID 
  | {infer B} 'B' name=ID count=INT;

// is equivalent to:
X: A | B;
A: 'A' name=ID;
B: 'B' name=ID count=INT;
```

```ts
// generated types
type X = A | B;

interface A extends AstNode {
    name: string
}

interface B extends AstNode {
    name: string
    count: number
}
```

### Assigned actions

Actions can also be used to control the structure of the semantic model types. This is a more advanced topic, so we recommend getting familiar with the rest of the documentation before diving into this section.

Let's consider two different grammars derived from the [Arithmetics example](https://github.com/langium/langium/blob/main/examples/arithmetics/src/language-server/arithmetics.langium). These grammars are designed to parse a document containing a single definition comprised of a name and an expression assignment, with an expression being any amount of additions or a numerical value.

The first one does not use assigned actions:

```langium
Definition: 
    'def' name=ID ':' expr=Expression;
Expression:
    Addition;
Addition infers Expression:
    left=Value ('+' right=Expression)?;
    
Primary infers Expression:
    '(' Expression ')' | {Literal} value=NUMBER;
```

وقتی تجزیه یک سند به شکل `def x: (1 + 2) + 3` باشد، شکل گره مدل معنایی آن به صورت زیر می باشد:

{{<mermaid>}}
graph TD;
expr((expr)) --> left((left))
expr --> right((right))
left --> left_left((left))
left --> left_right((right))
right --> right_left((left))
left_left --> left_left_v{1}
left_right --> left_right_{2}
right_left --> right_left_v{3}
{{</mermaid>}}

می‌توانیم ببینیم که گره‌های تودرتو `right -> left` در درخت غیر ضروری هستند و می‌خواهیم یک سطح تودرتو از درخت را حذف کنیم.
این کار را می توان با تغییر شکل دستور زبان و اضافه کردن یک عمل اختصاص داده شده انجام داد:

```langium
Definition: 
    'def' name=ID ':' expr=Addition ';';
Expression:
    Addition;
Addition infers Expression:
    Primary ({infer Addition.left=current} '+' right=Primary)*;
    
Primary infers Expression:
    '(' Expression ')' | {Literal} value=NUMBER;
```

اکنون تجزیه همان سند به این مدل معنایی تبدیل می شود:

{{<mermaid>}}
graph TD;
expr((expr)) --> left((left))
expr --> right((right))
left --> left_left((left))
left --> left_right((right))
right --> right_v{3}
left_left --> left_left_v{1}
left_right --> left_right_{2}
{{</mermaid>}}

با اینکه این یک مثال نسبتاً پیش پا افتاده است، اضافه کردن لایه‌های بیشتری از انواع عبارت در گرامر، کیفیت درخت نحو شما را به شدت کاهش می‌دهد، زیرا هر لایه ویژگی خالی `right` دیگری را به درخت اضافه می‌کند. اقدامات تعیین شده این موضوع را به طور کامل برطرف می کند.

## انواع اعلام شده(Declared Types)
این مهم است که به خاطر داشته باشید که با اینکه که انواع اعلام شده می توانند گرامرهای شما را بهبود بخشند، آنها یک ویژگی *bleeding edge هستند و هنوز در حال توسعه می باشند*.
از آنجا که استنتاج نوع هر موجودیت یک قانون را در نظر می گیرد، حتی کوچکترین تغییرات می تواند انواع استنتاج شده شما را به روز کند. این می تواند منجر به تغییرات ناخواسته در مدل معنایی شما و رفتار نادرست خدمات وابسته به آن شود. برای کاهش احتمال تغییرات ناسازگار هنگام اصلاح دستور زبان، *انواع اعلام شده* را به عنوان یک ویژگی جدید معرفی کرده ایم.
در بیشتر موارد، به‌ویژه برای طراحی‌های اولیه زبان، استفاده از استنتاج نوع برای تولید انواع بهترین انتخاب خواهد بود. همانطور که زبان شما شروع به رشد می کند، بهتر است که بخش هایی از مدل معنایی خود را با استفاده از انواع اعلام شده اصلاح کنید.
با این وجود، انواع اعلام شده می تواند *به خصوص* برای زبان های بالغ تر و پیچیده تر مفید باشد، جایی که یک مدل معنایی پایدار کلیدی است و تغییرات ناسازگار ایجاد شده توسط انواع استنباط شده می تواند خدمات زبان شما را خراب کند. انواع اعلام شده به کاربر این امکان را می دهد که نوع قوانین تجزیه کننده خود را **درست کند** و برای شناسایی تغییرات ناسازگار بر قدرت خطاهای اعتبارسنجی تکیه کند.


بیایید به مثال بخش قبلی بپردازیم:

```langium
X infers MyType: name=ID;
Y infers MyType: name=ID count=INT;

// should be replaced by:
interface MyType {
    name: string
    count?: number
}

X returns MyType: name=ID;
Y returns MyType: name=ID count=INT;
```

اکنون به صراحت `MyType` را مستقیماً در گرامر با کلمه کلیدی `interface` اعلام می کنیم. قوانین تجزیه کننده `X` و `Y` که گره‌هایی از نوع `MyType` ایجاد می‌کنند، باید به صراحت نوع گره‌ای را که ایجاد می‌کنند با کلمه کلیدی `returns` اعلام کنند.

بر خلاف [inferred types](#inferred-types), همه ویژگی ها باید به ترتیب اعلام شوند تا درون یک قانون تجزیه معتبر باشند. دستور زیر:

```langium
Z returns MyType: name=ID age=INT;
```

خطای اعتبارسنجی زیر را نشان می‌دهد `A property 'age' is not expected` زیرا اعلان `MyType` شامل ویژگی `age` نمی‌شود. به طور خلاصه، *انواع اعلام شده* یک لایه حفاظتی از طریق اعتبارسنجی به دستور زبان اضافه می کند که از عدم تطابق بین انواع مدل معنایی مورد انتظار و شکل گره های تجزیه شده جلوگیری می کند.


یک نوع اعلام شده همچنین می تواند انواع را گسترش دهد، مانند انواع دیگر اعلام شده یا انواع استنتاج شده از قوانین تجزیه کننده:

```langium
interface MyType {
    name: string
}

interface MyOtherType extends MyType {
    count: number
}

Y returns MyOtherType: name=ID count=INT;
```

اعلان صریح انواع اتحاد در گرامر با کلمه کلیدی `type` به دست می آید:
```ts
type X = A | B;

// generates:
type X = A | B;
```

<!-- Please note that it is not allowed to use an alias type as a return type in a parser rule. The following syntax is invalid:
```
type X = A | B;

Y returns X: name=ID;
``` -->

استفاده از `return` همیشه انتظار ارجاع به نوع موجود را دارد. برای ایجاد یک نوع جدید برای قانون خود، از کلمه کلیدی`infers` استفاده کنید یا به صراحت یک رابط را اعلام کنید.
### ارجاعات متقابل، آرایه ها و جایگزین ها


انواع اعلان شده دارای دستور خاصی برای اعلام ارجاعات متقابل، آرایه ها و جایگزین ها هستند:


```langium
interface A {
    reference: @B
    array: B[]
    alternative: B | C
}

interface B {
    name: string
}

interface C {
    name: string
    count: number
}

X returns A: reference=[B:ID] array+=Y (array+=Y)* alternative=(Y | Z);

Y returns B: 'Y' name=ID;

Z returns C: 'Z' name=ID count=INT;
```

### اقدامات(Actions)


اقدامات مربوط به یک نوع اعلام شده دارای دستور زیر هستند:

```langium
interface A {
    name: string
}

interface B {
    name: string
    count: number
}

X: 
    {A} 'A' name=ID 
  | {B} 'B' name=ID count=INT;
```

به عدم وجود کلمه کلیدی `infer` در مقایسه با [actions which infer a type](#simple-actions) توجه داشته باشید.

## اتحادهای مرجع


تلاش برای ارجاع به انواع مختلف عناصر می تواند فرآیندی مستعد خطا باشد. به قانون زیر نگاهی بیندازید که سعی می‌کند به یک `Function` یا `Variable` ارجاع دهد:


```langium
MemberCall: (element=[Function:ID] | element=[Variable:ID]);
```

از آنجایی که هر دو گزینه از نظر تجزیه‌کننده فقط یک `ID` هستند، این دستور زبان قابل تصمیم‌گیری نیست و سند `CLI `langium در طول تولید با خطا مواجه می‌شود. خوشبختانه، ما می‌توانیم با افزودن یک لایه غیرمستقیم با استفاده از یک قانون تجزیه‌کننده اضافی، این مورد را بهبود بخشیم:
```langium
NamedElement: Function | Variable;

MemberCall: element=[NamedElement:ID];
```

این به ما این امکان را می‌دهد با استفاده از قانون رایج `NamedElement` به `Function` یا `Variable` ارجاع دهیم. هرچند، اکنون قانونی را معرفی کرده‌ایم که هرگز تجزیه نمی‌شود، بلکه فقط برای هدف سیستم نوع وجود دارد تا انواع هدف صحیح مرجع را انتخاب کند. با استفاده از انواع اعلام شده، می‌توانیم این قانون استفاده‌ نشده را اصلاح کنیم و گرامر خود را در این فرآیند انعطاف‌ پذیرتر کنیم:
```langium
// Note the `type` prefix here
type NamedElement = Function | Variable;

MemberCall: element=[NamedElement:ID];
```

همچنین می‌توانیم از رابط‌ها به جای انواع اتحاد با نتایج مشابه استفاده کنیم:


```langium
interface NamedElement {
    name: string
}

// Infers an interface `Function` that extends `NamedElement`
Function returns NamedElement: {infer Function} "function" name=ID ...;

// This also picks up on the `Function` elements
MemberCall: element=[NamedElement:ID];
```
