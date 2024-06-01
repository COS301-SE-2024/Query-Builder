---
sidebar_position: 3
---

# Design Patterns
*Below you will find all design patterns that we are planning to implement into the system*

## Mediator

*The mediator design pattern defines an object that encapsulates how a set of objects interact. This pattern promotes loose coupling by preventing objects from referring to each other explicitly, allowing their interactions to be varied independently. It centralizes complex communications and control logic between related objects.*

Used to talk to the different types of inputs (colleagues) using the QueryIntermediateForm as the mediator. Different inputs will give different interfaces that the user can use

## Singleton

*The singleton design pattern ensures that a class has only one instance and provides a global point of access to that instance. This pattern is useful when exactly one object is needed to coordinate actions across the system.*

We will be using singleton to ensure there is only one instance connected to the database

## Bridge

*The bridge design pattern decouples an abstraction from its implementation so that the two can vary independently. This pattern involves an abstraction and an implementation being developed independently and the client can use them together. It's useful for scenarios where you want to avoid a permanent binding between an abstraction and its implementation.*

Is used to have different connection managers that can have different parsers to increase the scalability of the system.



