---
title: "Understanding dependency injection"
weight: 500
---

## Prerequisites

Finish the [Adding a test framework](/calculator-tutorial/1-test-framework).

## Goal

We will learn how to use Langium's dependency injection and how to trigger single stages of Langium's processes.

## Services and modules

Langium and generated languages from it, structure the code creation with the help of so-called "service types". A service type contains all services that your program needs. It is basically just a deeply nested object, where the leaf nodes are types and inner nodes are namespaces.

Example:
```typscript
type MyServiceObject = {
    ServiceA: ServiceAClass,
    MyNamespace: {
        ServiceB: ServiceBClass,
        ServiceC: ServiceCClass,
        AnotherNamespace: {
            //...and so on
            AnotherService: ServiceDClass
        }
    }
}
```

Be aware of that this is just a type definition. The true magic gets introduced by so-called "modules".
A module is created by putting the name of your service object into the `Module<...>` generic type. The resulting structure stays the same:
Inner nodes are namespaces, but the leaf nodes became factory methods for the type that this leaf node had in the service object type. The factory method has exactly one argument: The module itself. Sounds paradox, right?!

Example:
```typscript
const MyServiceModule: Module<MyServiceObject> = {
    ServiceA: (_services) => new ServiceAClass(),
    MyNamespace: {
        ServiceB: (_services) => new ServiceBClass(123),
        //Notice this line, where existing services are reused
        ServiceC: (services) => new ServiceCClass(services.ServiceA, services.MyNamespace.ServiceB),
        AnotherNamespace: {
            AnotherService: ServiceDClass.Instance
        }
    }
}
```


Be aware of that this is a value definition this time!

## How to use a module?

Every language created with Langium has a module as an entrypoint.
All you have to do is to call the `createLANGUAGE_NAMEServices` method from the `LANGUAGE_NAME-module.ts` file from the `language-server` folder.

```typescript
// importing from within a test file
import {createErrorMathServices} from '../src/language-server/error-math-module';

const services = createErrorMathServices();
```

If you want to access a service you just take the `services` object and call the service as normal property. All the dependency resolution is done automatically for you.

Let's write the following test:

```typescript
import {createErrorMathServices} from '../src/language-server/error-math-module'
import { Model } from '../src/language-server/generated/ast';
import 'jest-expect-message';

describe('Parsing tests', () => {
    it('should parse only', () => {
        // arrange + act
        const result = services.ErrorMath.parser.LangiumParser.parse<Model>('person Mario\nHello Mario!');
        expect(result.lexerErrors).toHaveLength(0);
        expect(result.parserErrors).toHaveLength(0);
        // assert
        const model = result.value;
        expect(model.persons).toHaveLength(1);
        expect(model.greetings).toHaveLength(1);
        expect(model.persons[0].name).toBe('Mario');
        expect(model.greetings[0].person.ref).toBeUndefined();
    });
});
```