---
sidebar_position: 4
---

# Architectural Styles/Patterns

Architectural Patterns are well-known compositions of architectural elements which allow a system to effectively meet its quality requirements.

## Some common architectural patterns which address QBee's top 5 quality requirements

### Usability

- Model-View-Controller (MVC)
- Flux
- Client-Server

### Security

- Microkernel
- Layered
- Model-View-Controller (MVC)
- Pipe-and-Filter

### Scalability

- Microservices
- Service-oriented Architecture (SOA)
- Blackboard
- Space-based

### Performance

- Service Mesh
- Load Balancer
- Throttling
- Map Reduce

### Reliability

- Process Pairs
- Triple Modular Redundancy (TMR)
- Passive Redundancy (Warm Spare)

## Selected Architectural Patterns for QBee

### Layered

*The layered architectural pattern arranges a software system into distinct layers, with each layer responsible for its own functionality. This ensures separation of concerns and modularisation of code*

This is an ideal pattern to structure QBee's entire stack of technologies. Our presentation layer consists of our frontend progressive web app (PWA), whilst our business logic layer consists of our API and server-side application. In between those two layers we have a security layer to handle data and user validation. Lastly, QBee has a database layer with both our own data store to store user data and queries, as well as the data stores that can be connected by users to the app for querying.

### Flux

*The Flux architectural pattern is a pattern used for building user interfaces which emphasises unidirectional data flow in the frontend of an application. Flux enforces a unidirectional flow of data, usually in a cycle that consists of **actions**, **dispatchers**, **stores**, and **views**. This one-way flow ensures predictability and simplifies the tracking of changes through the application.*

This is an ideal pattern to design QBee's frontend interface. For example, QBee's input classes are used by users to perform **actions** on their data. **Dispatchers** then send a JSON representation of this data to the backend, and the frontend also includes a **store** to cache query results. Lastly, QBee's table and report showing query results are **views** of a user's data.

### Pipe-and-filter

*Pipe-and-filter is an architectural pattern which has independent entities called filters (components) which perform transformations on data and process the input they receive, and pipes, which serve as connectors for the stream of data being transformed, each connected to the next component in the pipeline.*

This security-centric architectural pattern is ideal for QBee's API, since we can pass incoming data to the API through a number of filters that ensure that this data will not compromise our backend. These filters include validators of both data types as well as validators that provide user validation.

### Service-oriented

*Service-oriented Architecture is an architectural style that focuses on discrete services instead of a monolithic design.*

This is an ideal pattern to design QBee's various services that it provides to its frontend. For example, querying, providing database metadata, and managing organisations can be modularised into distinct services for improved interoperability and scalability.