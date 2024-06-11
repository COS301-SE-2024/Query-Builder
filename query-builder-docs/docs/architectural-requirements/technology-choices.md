---
sidebar_position: 7
---

# Technology Choices

## Our Backend and API

We have chosen **NestJS** as our Backend and API framework. Its object-oriented approach fits well with our modular system architecture. In addition, by being a Typescript framework it allows us to use compatible testing libraries to unit test both our backend and frontend. The technology choices we considered for our backend and API are as follows:

### NestJS

*NestJS is a progressive NodeJS framework designed for building efficient, reliable, and scalable server-side applications. It leverages TypeScript and incorporates principles from object-oriented programming (OOP), functional programming (FP), and reactive programming, making it a versatile and modern solution for backend development. With a modular architecture, NestJS allows for easy code organization and reusability.*

Pros

- NestJS's object-oriented approach allows it to fit in well with our modular architecture and how our class diagram has been designed.
- NestJS provides many RESTful API features 'straight out of the box'
- NestJS allows us to write APIs in Typescript, the same language we have chosen for our frontend, and this in turn allows us to use compatible testing libraries (Vitest and Jest) for both our frontends and backends

Cons

- NestJS introduces a number of concepts that are new to the QBee team, to modularise their code, and thus there is a bit of a learning curve to get to know the technology

### FastAPI

*FastAPI is a modern, fast (high-performance), web framework for building APIs with Python based on standard Python type hints.*

Pros

- FastAPI allows one to rapidly develop an API with minimal code
- FastAPI applications are written with Python, a popular language with many popular machine learning libraries which we may want to use for Natural Language Processing.

Cons

- FastAPI may be too minimal for our more complex backend tasks that we would like to perform.

### Django

*Django is a free and open-source, Python-based web framework that runs on a web server. It follows the model–template–views architectural pattern.*

Pros

- Django applications are written with Python, a popular language with many popular machine learning libraries which we may want to use for Natural Language Processing.

Cons

- Django introduces a number of concepts that are new to the QBee team and thus there is a bit of a learning curve to get to know the technology.