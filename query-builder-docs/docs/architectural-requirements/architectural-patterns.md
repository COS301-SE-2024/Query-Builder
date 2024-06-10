---
sidebar_position: 4
---

# Architectural Styles and Patterns

Architectural Patterns are well-known compositions of architectural elements which allow a system to effectively meet its quality requirements.

## Some common architectural patterns which address QBee's top 5 quality requirements

### Usability

- Model-View-Controller (MVC)
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

### Model-View-Controller (MVC)

*The Model-View-Controller architectural pattern allows for the separation of software business logic from the user interface. A user uses the **controller** to manipulate the **model**, which is an internal representation of the software's information. The **model** then updates the **view**, which is the user interface that the user sees and which displays the information to the user.*

This is an ideal pattern to design QBee's frontend interface. For example, QBee's input classes are **controllers** which can be used by the user to manipulate QBee's 'intermediate form' of query representation, which represents a **model** of query information. This **model** then updates the **views** that the user sees, which include the *other* inputs, and query results and reports.

### Microservices

*The microservices architectural pattern arranges a software system as a loosely-coupled collection of granular services, allowing for high scalability and maintainability*

This is an ideal pattern to design QBee's various services, such as querying, reporting and user management. They can run as separate "micro-apps" communicating through lightweight interfaces.