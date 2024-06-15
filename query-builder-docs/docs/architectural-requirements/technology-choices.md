---
sidebar_position: 7
---

# Technology Choices

## Our Backend and API

We have chosen **NestJS** as our Backend and API framework. Its object-oriented approach fits well with our modular system architecture. In addition, by being a Typescript framework it allows us to use compatible testing libraries to unit test both our backend and frontend. The technology choices we considered for our backend and API are as follows:

### NestJS

_NestJS is a progressive NodeJS framework designed for building efficient, reliable, and scalable server-side applications. It leverages TypeScript and incorporates principles from object-oriented programming (OOP), functional programming (FP), and reactive programming, making it a versatile and modern solution for backend development. With a modular architecture, NestJS allows for easy code organization and reusability._

Pros

- NestJS's object-oriented approach allows it to fit in well with our modular architecture and how our class diagram has been designed.
- NestJS provides many RESTful API features 'straight out of the box'
- NestJS allows us to write APIs in Typescript, the same language we have chosen for our frontend, and this in turn allows us to use compatible testing libraries (Vitest and Jest) for both our frontends and backends

Cons

- NestJS introduces a number of concepts that are new to the QBee team, to modularise their code, and thus there is a bit of a learning curve to get to know the technology

### FastAPI

_FastAPI is a modern, fast (high-performance), web framework for building APIs with Python based on standard Python type hints._

Pros

- FastAPI allows one to rapidly develop an API with minimal code
- FastAPI applications are written with Python, a popular language with many popular machine learning libraries which we may want to use for Natural Language Processing.

Cons

- FastAPI may be too minimal for our more complex backend tasks that we would like to perform.

### Django

_Django is a free and open-source, Python-based web framework that runs on a web server. It follows the model–template–views architectural pattern._

Pros

- Django applications are written with Python, a popular language with many popular machine learning libraries which we may want to use for Natural Language Processing.

Cons

- Django introduces a number of concepts that are new to the QBee team and thus there is a bit of a learning curve to get to know the technology.

## User Authorisation and Data Storage

We have selected Supabase for user authorization and data storage in our project. Below are details outlining the key advantages Supabase offers, alongside potential drawbacks we had to consider during implementation.

### Reasons for Choosing Supabase

Supabase emerges as a strong contender for user authorization due to several factors:

- **Simplified Backend Management**: Supabase combines a real-time database with built-in user authentication. This eliminates the need to develop and maintain a separate backend server for user management, saving development time and resources.

- **Authentication Features**: Supabase provides robust functionalities like email/password login, social login (e.g., Google, GitHub), passwordless login (magic links), and JWT (JSON Web Token) generation for secure authentication.

- **Scalability**: Supabase boasts a horizontally scalable architecture, allowing your application to handle increasing user loads without significant performance degradation.

- **Developer Experience**: Supabase was a requirement for our mini-project earlier in the semester, and we found it to be easy to use and well-documented. This positive experience influenced our decision to use it for our main project.

### Pros and Cons

While Supabase offers significant benefits, we had to consider potential drawbacks:

- **Vendor Lock-in**: When using the hosted version of Supabase, we are somewhat reliant on their infrastructure and roadmap. While self-hosting is possible, it requires additional expertise and maintenance effort.

- **Limited Customization**: Supabase provides a feature-rich platform, but for highly customized user authorization flows, we encountered limitations compared to building a completely customised solution. For example supabase does not support NestJS as extensively as it does with other frameworks like React or Vue.js, thus integration with our backend was more difficult.

- **Pricing**: Supabase offers a free tier with limited features. For larger projects or those requiring higher storage or bandwidth, paid tiers might be necessary, impacting project costs.

- **Maturity**: As a relatively young platform, Supabase might have a smaller community and less extensive documentation compared to more established solutions.

### Conclusion
In summary, Supabase is a strong choice for user authorization and data storage in our project. Its ease of use, and robust feature set align well with QBEE's requirements. While we had to consider potential drawbacks, the benefits of using Supabase outweighed these concerns.
