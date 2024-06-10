---
sidebar_position: 1
---

# Quality Requirements

Quality requirements determine the overall quality of QBee by specifying criteria that define how well the system performs or behaves.

## Usability

*How easy it is for users to interact with the system and how much effort is required of them to learn, operate, prepare input for and interpret the output of the system.*

Our target market consists largely of non-technical users that do not have the time to figure out how a complicated database system works. Our system needs to be easy to use for anyone who knows what they would like from their database, but not necessarily how to get it. The system should be simple enough such that anyone can quickly create database queries and reports.

## Security

*How capable the system is at protecting regular users and their data from those with malicious intent.*

Being a data-intensive application, QBee need to uphold high security standards when it comes to protecting user data. The system should be secure when storing users’ data and handling database connection links and passwords. It should also prevent malicious users from sending queries that can negatively impact databases.

## Scalability

*How easy it is to modify the system in order to improve it and extend its reach.*

The system should be easy to maintain and scale as new types of databases are added - this includes adding new query language models that can be used and new database varieties. It should also be able to scale as its user reach increases - this can be enabled by utilising existing backend technologies with demonstrative scalability.

## Performance

*How capable the system is at peforming its functional requirements, relative to the number of resources needed to provide this full functionality.*

The system should maintain a certain performance standard. Users will not want to wait for queries that take too long. Caching certain data as well as queries which are frequently used could increase overall performance.

## Reliability

*How capable the system is at operating without failure and maintaining a specified level of performance when used under specified normal conditions during a given time.*

QBee needs to be reliable since its target market will largely consist of executives and managers that need easy and continual access to their company data. If a report is needed and the system is down the user will be unable to query their database for information. Observability tools will allows for continuous monitoring of the system to detect failures. The system should not fluctuate in terms of its performance and responses when identical queries are performed.

## Confidentiality

*How capable the system is at keeping private user information private and not accessible to the general public or those unauthorised to access it.*

The system should not share information regarding users on the platform, or their databases or queries, unless the user shares that information willingly. This information should then only be shared with those authorised by the user to see it.

## Accessibility

*How easy it is for a user to access and use a given system.*

A user should be able to easily access the system without a complicated setup or installation procedure. This can be enabled by making QBee a progressive web app (PWA). 

## Maintainability

*How easy it is to modify the system in order to maintain it, correct defects and keep-it error-free.*

As the system is developed, and later scales, its architecture and organisation should be kept neat and maintainable such that defect correction is simple and easy to perform.