---
sidebar_position: 6
---

# Service Contracts

## Our technology stack
*Below we have the technology stack we will be using to implement the system*

[Technology stack](./technology-requirements.md)

## API interface contracts

- *QueryBuilder*

    Users can create queries, which are then transformed into an abstract JSON structure on the frontend. This JSON is sent to the backend where it is translated and checked for errors; any anomalies trigger an error notification to the user. If the query passes validation, it's forwarded to the database for execution. This process ensures security by preventing malicious alterations to the database query.

    Example of JSON data structure used to query database:
    ```json
    {
        "query_type": "SELECT",
        "language_type": "SQL",
        "columns": ["column1", "column2", "column3"],
        "table": "table_name",
        "conditions": {
            "column4": "value1",
            "column5": {"$gt": 10}
        },
        "limit": 100,
        "order_by": "column2",
        "order": "ASC"
    }   
    ```


- *Database connection and querying*

    Upon receiving JSON data from the frontend, the system translates it into the specified database query language and performs error checks. Any detected errors prompt a notification to the frontend for query adjustment. Passing validation, the query is executed on the database, and the response is relayed back. A report is generated, and both the report and raw data are returned to the user and displayed.

    Example of the JSON data translated into normal SQL:
    ```sql
    SELECT column1, column2, column3
    FROM table_name
    WHERE column4 = 'value1' AND column5 > 10
    ORDER BY column2 ASC
    LIMIT 100;
    ```

    Example of JSON data structure used for database connection:
    ```json
    {
        "url": "myDatabase.com",
        "password": "superSecretDatabasePassword"
    }
    ```