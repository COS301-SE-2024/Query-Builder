---
sidebar_position: 2
---

# Quality Requirements

Quality requirements determine the overall quality of QBee by specifying criteria that define how well the system performs or behaves.

## Top Five Quality Requirements

We have ranked our system's top five quality requirements from the most important to the least important. We have also quantified them:

### 1 - Usability

*How easy it is for users to interact with the system and how much effort is required of them to learn, operate, prepare input for and interpret the output of the system.*

Our target market consists largely of non-technical users that do not have the time to figure out how a complicated database system works. Our system needs to be easy to use for anyone who knows what they would like from their database, but not necessarily how to get it. The system should be simple enough such that anyone can quickly create database queries and reports.

**Quantification:** We plan to conduct User Experience (UX) Surveys on real non-technical users using our app's interface and the system should be able to have:
- an **overall successful completion rate** of at least 80% for simple tasks that users are invited to perform on the app
- a [**System Usability Scale (SUS)**](https://usabilitygeek.com/how-to-use-the-system-usability-scale-sus-to-evaluate-the-usability-of-your-website/) of at least 90% when gauging satisfaction of users using the system

### 2 - Security

*How capable the system is at protecting regular users and their data from those with malicious intent.*

Being a data-intensive application, QBee need to uphold high security standards when it comes to protecting user data. The system should be secure when storing users’ data and handling database connection links and passwords. It should also prevent malicious users from sending queries that can negatively impact databases.

**Quantification:** We have decided to address the following [**OWasp Top 10 cybersecurity risks**](https://owasp.org/www-project-top-ten/) in order to quantify that we have met our security requirement:

- **Broken Access Control:** The system should implement strong authorization rules to restrict access to resources based on user roles and permissions.
- **Cryptographic Failures:** The system should encrypt data at rest and in transit using strong algorithms and protocols. Regularly rotate cryptographic keys.
- **Injection:** The system should validate and sanitize all user inputs to prevent malicious code from being executed.
- **Insecure Design:** The system should follow secure coding practices and employ threat modeling techniques throughout the development lifecycle.
- **Security Misconfiguration:** The system should implement security best practices for all system components and follow vendor patching recommendations.
- **Vulnerable and Outdated Components:** The system should use software composition analysis tools to identify and update vulnerable components.
- **Identification and Authentication Failures:** The system should enforce multi-factor authentication and strong password policies.
- **Software and Data Integrity Failures:** The system should implement digital signatures and tamper-evident mechanisms to ensure data integrity.
- **Security Logging and Monitoring Failures:** The system should implement comprehensive logging and monitoring practices to detect suspicious activity.
- **Server-Side Request Forgery (SSRF):** The system should validate and restrict user-supplied URLs to prevent unauthorized requests to external systems.

### 3 - Scalability

*How easy it is to modify the system in order to improve it and extend its reach.*

The system should be easy to maintain and scale as new types of databases are added - this includes adding new query language models that can be used and new database varieties. It should also be able to scale as its user reach increases - this can be enabled by utilising existing backend technologies with demonstrative scalability.

**Quantification:** We plan to demonstrate that the system architecture can scale to handle many different types of databases and many users by:
- Allowing users to connect to and query database systems from at least **10 different database vendors**.
- Ensuring the system can handle **50 user requests per second**.

### 4 - Performance

*How capable the system is at peforming its functional requirements, relative to the number of resources needed to provide this full functionality.*

The system should maintain a certain performance standard. Users will not want to wait for queries that take too long. Caching certain data as well as queries which are frequently used could increase overall performance.

**Quantification:** We will ensure the system's performance by making sure that the system:

- Has an **average API response time of under 1 second** for regular API requests.
- Has an **average API response time of under 5 seconds** for API requests involving Natural Language Processing
- Can handle **50 user requests per second**.

### 5 - Reliability

*How capable the system is at operating without failure and maintaining a specified level of performance when used under specified normal conditions during a given time.*

QBee needs to be reliable since its target market will largely consist of executives and managers that need easy and continual access to their company data. If a report is needed and the system is down the user will be unable to query their database for information. Observability tools will allows for continuous monitoring of the system to detect failures. The system should not fluctuate in terms of its performance and responses when identical queries are performed.

**Quantification:** We will ensure that the system is reliable by making sure that it:
- Has at least **99.5% uptime**
- Has a Mean Time Between Failures (MTBF) of at least **1 month**.
- Has a Mean Time To Repair (MTTR) of at most **3 hours**.
- Error rates are kept below **0.5%**.
- Error recovery time is kept below **2 second**.

## Additional Quality Requirements

In addition to our top five quality requirements, we also plan to design our system such that it meets the following quality requirements.

### Confidentiality

*How capable the system is at keeping private user information private and not accessible to the general public or those unauthorised to access it.*

The system should not share information regarding users on the platform, or their databases or queries, unless the user shares that information willingly. This information should then only be shared with those authorised by the user to see it.

### Accessibility

*How easy it is for a user to access and use a given system.*

A user should be able to easily access the system without a complicated setup or installation procedure. This can be enabled by making QBee a progressive web app (PWA). 

### Maintainability

*How easy it is to modify the system in order to maintain it, correct defects and keep-it error-free.*

As the system is developed, and later scales, its architecture and organisation should be kept neat and maintainable such that defect correction is simple and easy to perform.