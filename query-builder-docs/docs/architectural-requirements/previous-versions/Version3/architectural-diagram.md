---
sidebar_position: 5
---

# Architectural Diagram

QBee's architecture has been designed using four different architectural patterns, which are described in the previous [**section**](./architectural-patterns.md), namely:
- **Layered Architectural Pattern** which is the overarching architecture that separates the system into distinct presentation, security, business and database layers
- **Flux Architectural Pattern** which is a frontend architecture in our presentation layer used to process user input, cache query results and display query results to users
- **Pipe-and-Filter Architectural Pattern** which is a security-centric architecture used in our API for data validation and user authentication and authorization
- **Service-oriented Architectural Pattern** which is used to provide distinct business-logic services to our frontend, such as query services and user management services

## QBee's official Architectural Diagram

![QBee Architectural Diagram](./../../../../static/img/Version3/QBeeBWArchitecturalDiagram.svg)

## QBee's Architectural Diagram colour-coded for demo purposes

![QBee Coloured Architectural Diagram](./../../../../static/img/Version3/QBeeFinalArchitecturalDiagram.svg)