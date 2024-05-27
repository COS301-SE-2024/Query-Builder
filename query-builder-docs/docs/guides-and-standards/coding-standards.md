---
title: Coding standards
description: Coding standards for the Query Builder Application
---

# Coding Standards

## General

### General styling rules

General styling source code rules are enforced using [Prettier](https://prettier.io/) for which there is a [VSCode plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). The VSCode workspace file will recommend the installation of the appropriate plugin.

Prettier can also be run from the command line, enabling the addition of a git hook to enforce styling rules. 

Prettier configuration file (`.prettierrc.json`) can be found in the root folder of the `Query-Builder` repository. 

Please note that prettier is used for __formatting rules only__. An appropriate linter for all languages used should still be in place. See [this documentation](https://prettier.io/docs/en/comparison.html) for details on the difference. 

### File and folder naming conventions

File and folder names should be lower-kebab-case wherever possible.

The reason uppercase letters may become a problem is that all filesystems are not case sensitive, and there are additional complexities when you include `git`'s peculiarities when considering file and folder names. 

For example, on windows systems `thisIsAFile.js` and `thisisafile.js` are considered equivalent, but those would be considered to be separate distinct names on non-windows systems (macOS and Linux variants).

There are also myriad of configuration settings that change how `git` handles case differences in the `git` repo, and how the source control system manages the differences between operating systems. To avoid issues, the simplest solution for programming languages that do not depend on a particular style of file names (like JS and TS) is to enforce lower-kebab-case.   

This would obviously not be a valid convention for Java source code but is reasonable in a JS/TS codebase.  

## Documenting code / Code comments

Please read the start of [this article](https://blog.bitsrc.io/documenting-your-typescript-projects-there-are-options-da7c8c4ec554), specifically, the section *Good code does not need documentation*   and consider whether your code needs documentation or comments, and if it does, make sure the documentation and comments are useful and worthwhile.


## HTML (including custom components)

1. All HTML element tags and attributes will be lowercase only, words in identifiers are split using kebab-case.

    > Correct

    ```html
    <my-component data-attribute="some value"></my-component>
    ```

    > Incorrect
    ```html
    <myComponent DataAttribute="some value"></myComponent>
    ```
2. All elements will be explicitly closed (especially empty elements) to ensure all HTML is also valid XML.

    > Correct
    ```html
    <my-component data-attribute="some value"></my-component>
    <my-component data-attribute="some value"/>
    ```
    > Never
    ```html
    <my-component data-attribute="some value">
    ```

## CSS

1. All CSS classes and other identifiers will be in lowercase only and words split using kebab-case.

    > Correct
    ```css
    .my-item {...}

    #my-id {...}
    ```

    > Incorrect
    ```css
    .MyItem {...}
    .myItem {...}
    ```

## Typescript

1. Prepend unused variables with `_` to indicate it was unused on purpose.

    > Correct
    ```js
    router.get(
    'my-route-name',
    handle_errors(async (_req, res) => {
        // do stuff here and never use the request variable
    })
    );
    ```

    > Incorrect

    ```js
    router.get(
    'my-route-name',
    handle_errors(async (req, res) => {
        // do stuff here and never use the request variable
    })
    );
    ```

2. Don't `return await somePromise` in an `async` function, you can just return the promise as a value instead. No need to wait for it to complete, just to wrap it in a new promise (which is what `async` functions will do automatically where needed). 

    > Correct
    ```js
    const findSiteId = async (tx, url) => {
    let site = await getSiteForUrl(url);
    return getIdForSite(site);
    }
    ```

    > Incorrect

    ```js
    const findSiteId = async (tx, url) => {
    let site = await getSiteForUrl(url);
    return await getIdForSite(site);
    }
    ```

3. Constructors and class names will be CamelCase starting with a capital letter (basically, this means all __types__ are defined with upper initial camel case).

    > Correct
    ```js
    // Modern class 
    class MyComponentClass {...}
    // Older style JS constructor function
    function MyComponentClass() {...}
    ```

    > Incorrect
    ```js
    // Modern class 
    class myComponentClass {...}
    // Older style JS constructor function
    function myComponentClass() {...}
    ```

4. All properties and top-level objects (including functions) will be named in camelCase starting with a lowercase letter.

    > Correct 
    ```js
    // Modern class 
    class MyComponentClass {
    constructor(){
        this.aProperty=...
        this.anArrowFunction=()=>{...}
    }

    function aFunction(){...}
    }

    let anObject = {
    aProperty: ...,
    aFunction: function(){...},
    anArrow: () => {...}
    }
    ```

5. Throw errors not strings or objects

    Reasons:
    * The Javascript `Error` type has useful properties for debugging and bug tracking (such as the type of the error, name, message, and [sometimes] stack traces)
    * Testing frameworks assume you will throw errors. For instance, the `chai` assertion library cannot check whether the correct string was thrown.
    * Checking the type of error does not have to resort to _magic strings_ and can instead use sub-classing of the `Error` type.

    > Incorrect

    ```js
    if(param<=0){
    throw 'Parameter has to be greater than 0';
    }

    if(!!someValue){
    throw {message:"Somevalue is undefined"};
    }
    ```


    > Correct
    ```js
    if(param<=0){
    throw new Error('Parameter has to be greater than 0');
    }

    // chai can test this function for throwing the correct errors
    expect(myFunnction).to.throw('Parameter has to be greater than 0');

    class InvalidParameterError extends Error {
    constructor(message, options={}){
    super(message, options);
    }
    }

    if(param<=0){
    throw new InvalidParameterError("Parameter 'param' has to be greater than 0");
    // logs will show Uncaught InvalidParameterError: arameter 'param' has to be greater than 0
    }

    // catching custom errors
    try{
    ...
    } catch(err){
    if(e instanceof InvalidParameterError){
        // type checks can be done by babel, webpack, linting tools and the typescript compiler
        // but if(e==='Parameter has to be greater than 0') magic string cannot be checked 
    }
    }
    ```
# Guidelines

## Why do we need guidelines

* We want to try to avoid common bugs / issues
* We want new members of our team to not be surprised at the way the system works
* Some guidelines aim to increase various forms of correctness while others aim to reduce the likelihood of accidents, some do both

Comments and suggestions for improvements are most welcome

### Structure of a guideline

Each guideline (suggestion) can have several parts:

* The rule itself – e.g., an if usually needs an else
* Reasons (rationales) – to make it easier for developers to understand why  
* Notes  
* Examples – concepts are hard to understand in the abstract, so let's make them concrete
* Alternatives – for “don’t do this” rules
* Exceptions – many rules apply widely, but not universally, so exceptions must be listed
* See also – references to related rules and/or further discussion (in this document or elsewhere)

## If usually needs an else

Whenever you write an `if`, consider whether there is a consequence to not adding an `else`.

Once you have considered it, and you are *really*, **really**, ***really*** sure why there does not need to be an `else`, put in the `else` and make a comment on why it is *really*, **really**, ***really*** not necessary.

### Example

```js
function square(x){
    if(Number.isFinite(x)){
        return x*x;
    }
}
```

In this case, the square function will sometimes return `undefined`. Considering that consequence, better options could be:

```js
/*
Make the failure clear - error when not a finite number.
square('4') is an error :)
*/
function square(x){
  if(Number.isFinite(x)){
    return x*x;
  } else {
    throw Error('Only squaring of finite numbers allowed');
  }
}

// or

/*
Let the platform handle it - return NaN when the parameter is bad.
square('4') is 16 though :(
*/
function square(x){
    return x*x;
}
```

# The ternary operator is not a replacement for the `if` statement.

The ternary operator should **only** be used for choosing a value based on a predicate, not for branching code paths.


### Notes

The ternary operator shouldn't be used for *branching*, since it indicates the intent that the *result* of a ternary expression is important.

Not only does it make understanding the code harder, but the Javascript interpreter also does NOT treat them as logically equivalent. 

### Examples

The below code snippets are NOT logically equivalent 

```js
if(someValue){
    doStuff();
} else {
    doOtherStuff();
}

// incorrect use of the ternary operator for branching
someValue?doStuff():doOtherStuff();
```

In the incorrect usage, the result of `doStuff()` and `doOtherStuff()` is being returned to the calling function, and then ignored, because the result of the ternary operator is being ignored.

## Switch should rarely fall through and usually has a default 

Whenever you see fall-throughs in a `switch`, consider whether there is a chance that it could cause headaches in the future.

Consider whether there is a sane default or even a sane exception for cases not explicit in the switch.

## Don't use `break` or `continue` in loops unless there is no other way.

### Reasons

For loops with `break` and `continue` are hard to reason about, especially when the break/continue is embedded inside a conditional. Rather make your intent clear in the conditional.

### Examples

Below is an example of code that is hard to follow, because it does the opposite of what 'description' says.
```js
function saveUsersIfTheyDoesNotExist(users){
  for(let user of users){
    let userExists = doesUserExist(user);
    if (userExists) {
      continue;
    } 
    saveUser(user);
  }
}
```
The code above clearly states to save the users when they do not exist, but the code does not match that 'intent'. Logically, the code above has the same effect as the corrected code below, but when reading code quickly, it can be easy to get confused. The code below has the added bonus of not needing `break` or `continue`.

```js
function saveUsersIfTheyDoesNotExist(users){
  for(let user of users){
    let userExists = doesUserExist(user);
    if (!userExists) {
       saveUser(user);
    } 
  }
}
```

### Exceptions

There are cases (probably only in deeply nested loops - which are a problem all their own) where the use of `break` or `continue` cannot be avoided. 

## Failures should be visible

Don't hide failures in logging or quiet ignorance, unless the failure is catastrophic, in which case the application should halt.

### Example

* Can't connect to the database - stop allowing the user to interact (or design your process not to require database access).
* Someone passed a bad input value (to a function / API call / whatever) - make the function fail and tell that someone what valid values look like. 

## Functions always do things, ALWAYS

Don't write a function that does absolutely nothing in some cases, or at least make it error when it ends up not doing anything.

### Examples

Given that your function name is `retrieveUser` to get a user's details from some database. The function has an input parameter of the user's database key. Keys are always strictly positive integers. You have a couple of options to ensure people who need to use your function aren't caught by surprise when they don't use the function as you intended.

Options are:
* Explicitly check whether the key is negative, undefined, null (or a string in one of those languages that don't honour types). The function should fail (exception/error). In addition, it could return a special response or even an empty thing (choose your flavour based on the language you are using). Don't just quietly ignore the fact that the developer using your function wanted it to do something.
* Don't explicitly validate input, and make sure that a valid value is returned.

### Notes

This rule is especially important for so-called 'void' functions that have side effects. It is very common in (some) reactive systems and (some) event-driven systems to fire off a request/event and notify me of the result through a reactive state somewhere. In these systems, you should definitely check validity before sending off the event, or you have to ensure that failures can be communicated to the caller properly as part of the asynchronously fired event.

```js
function retrieveUser(id){
  if(id && id>0){
    // do some database retrieval and update state with the value 
  } else {
     throw Error('Invalid Id'); 
  }
}
```

### Exceptions

A common exception to this rule is logging. Many logging functions will do nothing based on log levels and other *global* state. It is horrible, but that's how it is.

## Avoid using `innerHTML` or `innerText` to modify the DOM, prefer `textContent` instead.

Due to `innerHTML` parsing and setting HTML, it is possible to inject scripts into the DOM. Even though this is usually safe, there is no reason to have to consider the safety of the statement, if an alternative, such as `textContent` exists.

The performance penalty of using `innerText` instead of `textContent` is also well established.

### Note

There are some cases when one does just want to alter the `innerText` and not the entire `textContent`. For example: when the `HTMLElement` contains both text and other elements, `innerText` would replace the text but not the other elements. This can be solved by nesting the text in an additional `HTMLElement` to avoid using `innerText`.

### References

* [Why `textContent` is better than `innerHTML` and `innerText`?](https://blog.cloudboost.io/why-textcontent-is-better-than-innerhtml-and-innertext-9f8073eb9061)
* [`innerText` vs. `textContent`](https://kellegous.com/j/2013/02/27/innertext-vs-textcontent/)

## There are no special numbers, and none of them are magical

This is self explanatory, but you can investigate what it means and update this page if you want.

## Express intent where possible

For instance, when looping over elements of some collection, the idea of the element's index in the collection is usually unimportant. Use a for-each-in-collection construct instead of a for-each-index-of-collection construct

# Principles

## Why we need principles

* When someone leaves, we (as a team) lose their domain expertise and may struggle to support and debug features developed by former team-members
* Due to the momentum at which we often have to deliver features, we tend to skip steps and buggy or unmaintainable code reaches the production system
* Due to the momentum, we often deliver MVP features that need to be repeatedly overhauled whenever small additional features are required. 

## SDLC (and what we need to do better)

We should always know where in the Debt Quadrant our development falls.
 
![Tehcnical Debt](https://martinfowler.com/bliki/images/techDebtQuadrant.png)

## Domain and language

* Make sure that the names chosen for things are well understood amongst all stakeholders
* If necessary, document the names chosen
* Make sure the processes are well understood by all the stakeholders
* If necessary, document the processes

## Code

![BobMartinBoyscout](https://miro.medium.com/max/638/1*ku5a8sk61smgtNYbfU7SLw.jpeg)

* Follow [the boy scout rule](https://github.com/97-things/97-things-every-programmer-should-know/blob/master/en/thing_08/README.md). Keep your code (and your git history clean).
* [Act with prudence](https://github.com/97-things/97-things-every-programmer-should-know/blob/master/en/thing_01/README.md)
* Keep your development [as simple as possible, and no simpler](https://github.com/97-things/97-things-every-programmer-should-know/blob/master/en/thing_05/README.md) (*we don't know whether Einstein actually said that or not, but it makes sense*)
* [Code Layout Matters](https://github.com/97-things/97-things-every-programmer-should-know/blob/master/en/thing_13/README.md), so does git commit layout. Look at your git graph before pushing.
* [Code in the Language of the Domain](https://github.com/97-things/97-things-every-programmer-should-know/blob/master/en/thing_11/README.md) wherever possible
* Don't Touch that File! - Do not commit changes to a line of a file you did not make on purpose!
  * The rule is, if you touched it last, you are responsible!
  * If the last person to commit to a file/line was you, you maintain it and you are responsible for fixing it when things inevitably break.
  * If your code editor automagically formatted the whole file, but you only meant to add one line, then turn off your formatter and re-apply the change. Commit only the one line you meant to touch.
* [Know Your Next Commit](https://github.com/97-things/97-things-every-programmer-should-know/blob/master/en/thing_47/README.md) - in other words - know what you will be touching/adding/deleting/changing for the current ticket you are working on.   
  * When you start with a ticket, make sure the first thing you do is investigate and understand what you will need to do.
* Understand [Technical Debt](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html)
* Learn to [think about states](https://github.com/97-things/97-things-every-programmer-should-know/blob/master/en/thing_84/README.md), and better yet, learn to think about the overall process and how it affects the state.
* [Don't log ~~too much~~ unless you absolutely need to](https://github.com/97-things/97-things-every-programmer-should-know/blob/master/en/thing_90/README.md).
* [You have to care about the code](https://github.com/97-things/97-things-every-programmer-should-know/blob/master/en/thing_96/README.md)

I really would recommend reading the [97 things every programmer should know](https://github.com/97-things/97-things-every-programmer-should-know/blob/master/en/SUMMARY.md). Though not all these things apply to every team, the lessons are worth knowing.

## GUI Design

* Principle of least astonishment - the user should never be confused as to what a button will do
* Keep it simple 
* Keep it usable
* Ask 'What would the user do?', remember *you* are **not** the [*only*] user. 

## REST API Design

* Follow naming conventions and HTTP method specifications from [REST API Turorial](https://www.restapitutorial.com/).
* URI's are for _resources_ and should never contain verbs like _create_, _update_, _save_ or _delete_. The HTTP verb is responsible for that part.
* URI's should never depend on capitalisation and should not be 'camelCase' or 'PascalCase'. For all multi-word resource names, lower-case 'kebab-case' is preferred.
* If you want to learn about good error design for HTTP APIs, then read this [good (boring) old RFC7807](https://datatracker.ietf.org/doc/html/rfc7807)
 
## Security

* Think like someone trying to hack or game the system at every step of the process

## Testing

* Please refer to [Testing Policy]
