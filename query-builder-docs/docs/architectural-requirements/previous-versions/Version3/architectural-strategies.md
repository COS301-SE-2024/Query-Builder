---
sidebar_position: 3
---

# Architectural Strategies/Tactics

## Usability

**Interactive UI design:** Should have a easy to use interface such that a non-technical user is able to easily use the system without prior knowledge of databases and its systems. 

_QBee will make it easy for non-technical users allowing them to easily interact with the database using a well constructed frontend. This frontend will increase usability of the system and the connected database as the users only interact with the database at a very high level_

## Security

**Role based security:** Restrict access to system resources based on roles assigned to individual users, ensuring that users only have access to the information and functionality relevant to their role.

_QBee will only allow certain users in their organization to be able to access certain sensitive information like database passwords_

**Fail securely:** Implement measures to handle failures gracefully, ensuring that even in the event of a security breach or system failure, sensitive information is protected and the system remains secure.

_When the system fails QBee should disconnect from connections before breaking, this will hinder malicious users from sending queries to databases while the system is down_

**Authentication:** Verify the identity of users accessing the system, typically through methods such as passwords, biometrics, or multi-factor authentication, to prevent unauthorized access and protect sensitive data.

_All users using QBee should be authenticated in such a manner that they are conforming to the role based hierarchy._

## Scalability

**Increase processing power:** Scale the system by adding more processing power, such as upgrading hardware or utilizing cloud-based services with higher computing capacity, to handle increased workload and user demands.

_For QBee we will be using servers located at DNS.AFRICA where we are able to increase hardware components when needed_

**Spread load across time:** Distribute workload evenly over time by scheduling tasks during off-peak hours or implementing mechanisms to queue requests during peak periods, ensuring consistent performance and preventing overload on the system.

_When a big query is sent and multiple other are also sent by other users the system should spread out the loads such that a bottleneck is not created_

## Performance

**Caching:** Store frequently accessed data in a cache to reduce the need for repeated processing and improve response times, particularly for read-heavy applications.

_QBee will cache certain information and queries that the user regularly uses such that the system does not need to waste processing power to get the same data over and over_

**Efficient storage usage:** Optimize storage usage by compressing data, removing redundant information, and implementing efficient data structures, reducing storage costs and improving performance.

_QBee will be compressing data (eg. images) to save space_

**Pre-processing:** Perform computationally intensive tasks or data transformations in advance, storing the results for future use, to reduce processing time and improve overall system performance.

_QBee will pre-process the database to be able to know what and where everything is in the database before the user wants to query it_

## Reliability

**Redundancy:** Improve reliability by deploying redundant components and failover mechanisms, ensuring that the system can continue operating even in the event of hardware failures or other disruptions.

_QBee will have redundancy in server usage (managed by DNS.AFRICA) such that the system is always online_

**Maintain backups:** Regularly backup system data and configuration settings to external storage or remote servers, ensuring that critical information can be restored in the event of data loss, corruption, or system failure.

_QBee will be storing previous versions of certain components before updating the system. This allows it to rollback to previous versions if a new version fails._