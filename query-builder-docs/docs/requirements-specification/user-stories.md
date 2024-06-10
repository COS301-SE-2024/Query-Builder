---
title: User Stories
description: The user stories of the QBee Query Builder system
sidebar_position: 3
---

# User Stories

## User Management Subsystem
1. Provide a Secure Authentication Process to Users
   1. As a new user, I want to register on the application through an onboarding process involving a one-time pin, so that I can securely create my account.
      - Acceptance Criteria:
         - Users can enter their email to receive a one-time pin (OTP).
         - Users receive an OTP via email.
         - Users can enter the OTP to verify their identity.
         - Users can set their password after OTP verification.
         - Users receive a confirmation email after successful registration.
   
   2. As a user, I want to log into the system with my credentials, so that I can access my account.
      - Acceptance Criteria:
         - Users can enter their registered email and password.
         - The system authenticates the credentials and grants access if valid.
         - Users are notified of unsuccessful login attempts.

   3. As a user, I want to reset my password if I have forgotten it, so that I can regain access to my account.
      - Acceptance Criteria:
         - Users can initiate the password reset process by entering their registered email.
         - Users receive a password reset link or OTP via email.
         - Users can create a new password using the link or OTP.
         - Users receive a confirmation email after successfully resetting their password.

2. Provide an Interface to Edit or Change User's Information
   1. As a user, I want to change my personal information (e.g., first name, last name, email, phone number), so that my account details are up-to-date.
      - Acceptance Criteria:
         - Users can access an "Edit Profile" section within the application.
         - Users can update fields such as first name, last name, email, and phone number.
         - Users must confirm changes with their password.
         - Users receive a notification email confirming the updates.
   
3. Allow Users to Set Personal Preferences
   1. As a user, I want to set personal preferences, so that the application is tailored to my needs and preferences.
      - Acceptance Criteria:
         - Users can access a "Preferences" section within the application.
         - Users can update settings such as notification preferences, and appearance settings.
         - Users can save changes their updated preferences.
         - Users will receive a toast notification in the application.

## Database System Manager Subsystem
1. Allow Users to Connect to External Databases
   1. As a user, I want to connect to external databases and store the database environment for interaction purposes, so that I can manage and interact with multiple databases.
      - Acceptance Criteria:
         - Users can enter connection details (e.g., database URL, host, Database Anonymous key, username, password).
         - The system validates the connection details and establishes a connection to the external database.
         - Users can save the connection settings for future use.
         - Users receive a toast notification of confirmation of successful connection and storage.
         - Users will receive a toast notification of an unsuccessful connenction, if anything goes wrong.

2. Allow Users to Update Database Connection Details
   1. As a user, I want to update the database connection details, so that I can ensure my connection settings remain current and correct.
      - Acceptance Criteria:
         - Users can access and edit saved database connection details (e.g., host, port, username, password).
         - The system validates the updated details before saving them.
         - Users receive a toast notification of confirmation of successful updates to the connection details.
         - Users will receive a toast notification of an unsuccessful update, if anything goes wrong.

3. Schema Management
   1. As a user, I want to extract the metadata from the database schema, so that I can understand the structure and properties of the database.
      - Acceptance Criteria:
         - Users can request metadata extraction for a connected database.
         - The system retrieves and displays the metadata (e.g., tables, columns, data types, constraints).
         - Users can view the extracted metadata in a structured format.
   
4. Query Execution
   1. As a user, I want to execute a specific query on the database, so that I can retrieve the necessary data.
      - Acceptance Criteria:
         - Users can select a pre-saved or a specific created query.
         - The system translates the query to the specific database language.
         - The translated query is executed on the connected database.
         - Users are notified of the execution status (success or failure).
   
   2. As a user, I want to be able to see the results from the database after executing a query, so that I can view and analyze the retrieved data.
      - Acceptance criteria:
         - The system retrieves the results of the executed query from the database.
         - The results are displayed to the user in a readable and organized format.

## Query Builder Subsystem
1. Choose Database to Query
   1. As a user, I want to choose a database to query, so that I can specify which database I want to run my queries against.
      - Acceptance criteria:
         - Users can view a list of connected databases.
         - Users can select a database from the list.
         - The system confirms the selected database for the query session.

2. Create a Query
   1. As a user, I want to use a drag and drop UI to create a query, so that I can build queries intuitively without writing code.
      - Acceptance Criteria:
         - Users can drag and drop database elements (e.g., tables, columns) to construct a query.
         - The system visually represents the query structure.
         - Users can run and modify the query within the drag and drop interface.

   2. As a user, I want to create a query via a form, so that I can build queries by filling out structured input fields.
      - Acceptance Criteria:
         - Users can access a form-based interface to input query parameters.
         - The form allows selection of tables, columns, and conditions.
         - Users can submit the form to generate and run the query.

3. Toggle between views
   1. As a user, I want to toggle between different views of the query building process, so that I can switch between visual and form-based query creation.
      - Acceptance Criteria:
         - Users can switch between the drag and drop interface and the form interface.
         - The system maintains the query state when switching views.
         - Users are notified of any changes or discrepancies when switching views.

4. View Query Results Summary
   1. As a user, I want to view a summary of the results of the query, so that I can quickly understand the outcome of my query.
      - Acceptance Criteria:
         - The system displays a summary of the query results, including key statistics (e.g., row count).
         - Users can view a preview of the result set.
         - Users can access detailed results if needed.

5. Save Queries
   1.  As a user, I want to save queries that I have created, so that I can reuse or modify them later.
      - Acceptance Criteria:
         - Users can save the current state of their query.
         - Saved queries are accessible from a query library or saved queries list.
         - Users can name and describe their saved queries for easy identification.

## Reporting subsystem
1. Generate Reports
   1. As a user, I want to generate reports of the query data, so that I can analyze and present the data effectively.
      - Acceptance Criteria:
         - Users can initiate report generation from the query results.
         - The system processes the data and generates the report.
         - Users can choose the type of report to generate (graph or table).
      
      1. As a user, I want to generate graph reports of the query data, so that I can visualize the data in graphical format.
         - Acceptance Criteria:
            - Users can select graph types (e.g., bar, line, pie).
            - The system generates the graph based on the query data.
            - Users can customize graph settings and labels.
      2. As a user, I want to generate table reports of the query data, so that I can view the data in a structured tabular format.
         - Acceptance Criteria:
            - Users can select columns and apply sorting or filtering options.
            - The system generates a table with the query data.
            - Users can adjust the table layout and formatting.

2. Share Reports
   1. As a user, I want to share the reports generated within the system, so that I can collaborate with others.
      - Acceptance Criteria:
         - Users can select a report to share.
         - Users can choose recipients (individual users or organizations) from a list.
         - The system sends the report and notifies the recipients.
   
   2. As a user, I want to share an exported report with other users, so that they can access and review the data.
      - Acceptance Criteria:
         - Users can select individual users to share the report with.
         - Shared users receive a copy of the exported file/data.

3. Export Reports
   1. As a user, I want to export the reports generated, so that I can use the data outside the system.
      - Acceptance Criteria:
         - Users can choose the export format (PDF, CSV, Excel).
         - The system generates the report in the selected format.
         - Users can download or receive the exported report via email.

      1. As a user, I want to export reports as a PDF, so that I can share and print the report in a standard document format.
         - Acceptance Criteria:
            - Users can initiate export as a PDF.
            - The system generates a PDF file of the report.
            - Users can download or print the PDF.
      
      2. As a user, I want to export reports as a CSV, so that I can analyze the data using spreadsheet software.
         - Acceptance Criteria:
            - Users can initiate export as a CSV.
            - The system generates a CSV file of the report data.
            - Users can download the CSV file.
      
      3. As a user, I want to export reports as an Excel file, so that I can use the data in Excel for further analysis and reporting.
         - Acceptance Criteria:
            - Users can initiate export as an Excel file.
            - The system generates an Excel file of the report data.
            - Users can download the Excel file.

## Organisation subsystem
1. Create an Organisation
   1. As a user, I want to create an organisation, so that I can manage resources and users within my organisation.
      - Acceptance Criteria:
         - Users can enter organisation details (e.g., name, address).
         - The system assigns the user creating the organisation as the organisation admin.
         - Users receive confirmation of successful organisation creation.

2. Connect a Database to the Organisation
   1. As an organisation admin, I want to connect a database to the organisation, so that the organisation can use it for queries and reporting.
      - Acceptance Criteria:
         - Organisation admins can enter database connection details (e.g., type, host, port, username, password).
         - The system validates and establishes the database connection.
         - Users receive confirmation of successful database connection.

3. Add Other Users to the Organisation
   1. As an organisation admin, I want to invite unregistered QBee users to join the organisation, so that I can expand my team.
      - Acceptance Criteria:
         - Organisation admins can enter email addresses to send invitations.
         - The system sends an invitation email to the unregistered users.
         - Invited unregistered users can register for an account on QBee
         - These new users can then join the organisation.

   2. As an organisation admin, I want to invite registered QBee users to join the organisation, so that I can expand my team.
      - Acceptance Criteria:
         - Organisation admins can enter email addresses to send invitations.
         - The system sends an invitation email to the registered users.
         - Invited registered users can join the organisation.

   3. As an existing QBee user, I want to accept invites to an organisation, so that I can join and contribute to the organisation.
      - Acceptance Criteria:
         - Users receive an invitation notification or email.
         - Users can accept the invitation to join the organisation.
         - The system adds the user to the organisation upon acceptance.

4. Manage User Roles
   1. As an organisation admin, I want to assign roles to users in the organisation, so that I can define their permissions and responsibilities.
      - Acceptance Criteria:
         - Organisation admins can view a list of users in the organisation.
         - Organisation admins can assign predefined roles to each user.
         - Users receive notifications of their assigned roles.

   2. As an organisation admin, I want to manage the authorization and access of each role, so that I can control what users can do within the organisation.
      - Acceptance Criteria:
         - Organisation admins can define and modify permissions for each role.
         - The system enforces role-based access control.
         - Users can only access features and data permitted by their roles.
   3. As an organisation admin, I want to define a new role for the organisation, so that I can create custom roles tailored to the organisation’s needs.
      - Acceptance Criteria:
         - Organisation admins can access a role management interface.
         - Organisation admins can create a new role by specifying its name and permissions.
         - The system saves the new role and makes it available for assignment.
         - Organisation admins can assign the new role to users in the organisation.
   
5. Leave the organisation
   1. As a user, I want to leave the organisation, so that I am no longer associated with it.
      - Acceptance Criteria:
         - Users can initiate the process to leave the organisation.
         - The system confirms the user’s decision to leave.
         - The system removes the user from the organisation and updates their status.
   
6. Remove Users from the Organisation
   1. As an organisation admin, I want to remove users from the organisation, so that I can maintain the desired team composition and security.
      - Acceptance Criteria:
         - Organisation Admins can view a list of users in the organisation.
         - Organisation Admins can select and remove users, except other organisation admins.
         - Removed users receive a notification of their removal.

7. Access Organisation Saved Queries
   1. As a user in the organisation, I want to access organisation saved queries, so that I can utilize existing queries for my tasks.
      - Acceptance Criteria:
         - Users can view a list of saved queries within the organisation, based on their role.
         - Users can run and modify the saved queries based on their permissions.
         - The system ensures access control based on user roles.

8. Save queries for the organisation
   1. As a user, I want to add a saved query to the organisation based on my role, so that I can share useful queries with my team.
      - Acceptance Criteria:
         - Users with appropriate permissions can save their queries to the organisation's repository.
         - Users can add descriptions and tags to the saved queries for easier retrieval.
         - The system validates and saves the query to the organisation's repository.
         - The saved query becomes accessible to other users in the organisation based on their roles and permissions.

# Use Cases

## Use Cases for User Management Subsystem
### 1. Provide a Secure Authentication Process to Users
   1. User Registration with One-Time Pin
      - __Use Case Name:__ User Registration with One-Time Pin

      - __Actors:__ New User, System

      - __Preconditions:__ The user has not registered on the application before.

      - __Postconditions:__ The user is successfully registered and can log in to the system.

      - Main Success Scenario:
         1. User initiates registration: The new user accesses the registration page.

         2. User enters email: The user enters their email address and submits the registration form.

         3. System sends OTP: The system generates a one-time pin (OTP) and sends it to the user's email.

         4. User enters OTP: The user receives the OTP and enters it into the registration form.

         5. System verifies OTP: The system verifies the OTP.

         6. User sets password: Upon successful OTP verification, the user is prompted to set a password.

         7. System confirms registration: The system saves the user's credentials and sends a confirmation email.

         8. User receives confirmation: The user receives a confirmation email indicating successful registration.

      - Extensions:
         - 3a. Invalid email: If the email is invalid, the system prompts the user to enter a valid email.
         
         - 4a. OTP not received: If the user does not receive the OTP, they can request a new one.
         
         - 5a. Invalid OTP: If the OTP is invalid, the system prompts the user to enter the correct OTP.

   2. User Login
      - __Use Case Name:__ User Login

      - __Actors:__ User, System

      - __Preconditions:__ The user has already registered on the application.

      - __Postconditions:__ The user is successfully logged in and can access their account.

      - Main Success Scenario:
         1. User initiates login: The user accesses the login page.
         
         2. User enters credentials: The user enters their registered email and password.
         
         3. System authenticates credentials: The system checks the credentials.
         
         4. System grants access: If the credentials are valid, the system grants access to the user’s account.
         
         5. User accesses account: The user is redirected to their account dashboard.
      - Extensions:
         - 3a. Invalid credentials: If the credentials are invalid, the system notifies the user of the unsuccessful login attempt.

   3. Password Reset
      - __Use Case Name:__ Password Reset

      - __Actors:__ User, System

      - __Preconditions:__ The user has a registered account and has forgotten their password.

      - __Postconditions:__ The user has successfully reset their password and can log in with the new password.

      - Main Success Scenario:
         1. User initiates password reset: The user accesses the password reset page.

         2. User enters email: The user enters their registered email address.

         3. System sends reset link/OTP: The system sends a password reset link or OTP to the user's email.

         4. User receives reset link/OTP: The user receives the password reset link or OTP.

         5. User resets password: The user clicks the reset link or enters the OTP, then creates a new password.

         6. System confirms password reset: The system updates the user's password and sends a confirmation email.

         7. User receives confirmation: The user receives a confirmation email indicating the password reset was successful.
      
      - Extensions:
         - 3a. Invalid email: If the email is not registered, the system notifies the user to enter a valid registered email.
         
         - 5b. Expired link/OTP: If the reset link or OTP has expired, the system prompts the user to request a new one.

### 2. Provide an Interface to Edit or Change User's Information
   1. Edit Personal Information
      - __Use Case Name:__ Edit Personal Information

      - __Actors:__ User, System

      - __Preconditions:__ The user is logged into the application.

      - __Postconditions:__ The user's personal information is successfully updated in the system.

      - Main Success Scenario:
         1. User accesses profile: The user navigates to the "Edit Profile" section within the application.

         2. User updates information: The user edits their personal information fields such as name, surname, email, and phone number.

         3. User confirms changes: The user confirms the updates by entering their password.
         
         4. System validates changes: The system validates the new information and password.
         
         5. System saves changes: The system updates the user's information in the database.
         
         6. System sends notification: The system sends a toast notification, within the application, to the user confirming the updates.
         
         7. User receives confirmation: The user receives a confirmation toast notification, within the application, indicating their personal information has been successfully updated.
      
      - Extensions:
         - 3a. Incorrect password: If the entered password is incorrect, the system notifies the user and prompts them to enter the correct password.

         - 4a. Invalid information: If any updated information is invalid (e.g., incorrect email format), the system prompts the user to correct the information.
   
   2. Set Personal Preferences
      - __Use Case Name:__ Set Personal Preferences

      - __Actors:__ User, System

      - __Preconditions:__ The user is logged into the application.

      - __Postconditions:__ The user's personal preferences are successfully updated and applied in the system.

      - Main Success Scenario:
         1. User accesses preferences: The user navigates to the "Preferences" section within the application.
         
         2. User updates settings: The user updates various settings such as notification preferences and appearance settings.
         
         3. User saves changes: The user saves their updated preferences.
         
         4. System validates changes: The system validates the new preferences.
         
         5. System saves changes: The system updates the user's preferences in the database.
         
         6. System displays notification: The system displays a toast notification within the application indicating that the preferences have been successfully updated.
      
      - Extensions:
         - 2a. Invalid preferences: If any updated preference is invalid or unsupported, the system prompts the user to correct the preference settings.
   
## Use Cases for Database Systems Manager Subsystems
### 1. Allow Users to Connect to External Databases
   1. Connect to External Databases
      - __Use Case Name:__ Connect to External Databases

      - __Actors:__ User, System

      - __Preconditions:__ The user is logged into the application.

      - __Postconditions:__ The user successfully connects to an external database and saves the connection details for future use.

      - Main Success Scenario:
         1. User initiates connection: The user navigates to the "Connect to Database" section within the application.
         
         2. User enters connection details: The user enters the required connection details (e.g., database URL, host, Database Anonymous key, username, password).
         
         3. System validates details: The system validates the connection details provided by the user.
         
         4. System establishes connection: If the details are valid, the system establishes a connection to the external database.
         
         5. User saves connection settings: The user saves the connection settings for future use.
         
         6. System confirms connection: The system stores the connection settings and displays a toast notification confirming the successful connection and storage.
         
         7. User receives confirmation: The user sees the toast notification indicating a successful connection.
      
      - Extensions:
         - 3a. Invalid details: If the connection details are invalid, the system displays a toast notification indicating an unsuccessful connection and prompts the user to correct the details.
         
         - 4a. Connection failure: If the system cannot establish a connection, it displays a toast notification indicating an unsuccessful connection and provides troubleshooting options.

### 2. Allow Users to Update Database Connection Details
   1. Update Database Connection Details
      - __Use Case Name:__ Update Database Connection Details

      - __Actors:__ User, System

      - __Preconditions:__ The user has previously saved database connection details.

      - __Postconditions:__ The user's updated database connection details are successfully saved and validated.

      - Main Success Scenario:
         1. User accesses connection settings: The user navigates to the "Manage Database Connections" section within the application.
         
         2. User selects a connection: The user selects the saved database connection they wish to update.
         
         3. User updates connection details: The user updates the necessary connection details (e.g.Database URL, Anonymous key, host, username, password).
         
         4. System validates details: The system validates the updated connection details.
         
         5. System saves updates: If the details are valid, the system saves the updated connection settings.
         
         6. System confirms update: The system displays a toast notification confirming the successful update of the connection details.
         
         7. User receives confirmation: The user sees the toast notification indicating a successful update.
      
      - Extensions:
         - 4a. Invalid details: If the updated connection details are invalid, the system displays a toast notification indicating an unsuccessful update and prompts the user to correct the details.
         
         - 5a. Update failure: If the system cannot save the updated details, it displays a toast notification indicating an unsuccessful update and provides troubleshooting options.

### 3. Extract Metadata from Database Schema
   1. Extract Metadata from Database Schema
      - __Use Case Name:__ Extract Metadata from Database Schema

      - __Actors:__ User, System

      - __Preconditions:__ The user is logged into the application and connected to an external database.

      - __Postconditions:__ The user successfully extracts and views the summary of the metadata of the database schema.

      - Main Success Scenario:
         1. User requests metadata extraction: The user navigates to the "Database Metadata" section within the application and requests metadata extraction for the connected database.

         2. System retrieves metadata: The system retrieves the metadata from the connected database, including tables, columns, data types, and constraints.

         3. System displays metadata: The system displays the extracted metadata to the user in a structured format.

         4. User views metadata: The user reviews the displayed metadata to understand the structure and properties of the database.
      
      - Extensions:
         - 2a. Connection failure: If the system cannot connect to the database, it displays an error message and prompts the user to check the connection settings.

         - 2b. Metadata retrieval failure: If the system encounters an error while retrieving metadata, it displays an error message and suggests possible troubleshooting steps.

   
### 4. Query Execution
   1. Execute a Specific Query on the Database
      - __Use Case Name:__ Execute a Specific Query on the Database

      - __Actors:__ User, System

      - __Preconditions:__ The user is logged into the application and connected to an external database.

      - __Postconditions:__ The user's query is successfully executed on the database, and the user is notified of the execution status.

      - Main Success Scenario:
         1. User selects a query: The user selects a pre-saved query or creates a new query within the application.

         2. System translates the query: The system translates the query into the specific language of the connected database.
         
         3. System executes the query: The system executes the translated query on the connected database.
         
         4. System notifies execution status: The system notifies the user of the execution status, indicating success or failure.

         5. User receives notification: The user receives a notification of the query execution status.

      - Extensions:
         - 2a. Invalid query: If the query is invalid or contains errors, the system notifies the user and prompts them to correct the query.

         - 3a. Execution failure: If the system encounters an error during query execution, it displays an error message and suggests possible troubleshooting steps.
   
   2.  View Results from Executed Query
         - __Use Case Name:__ View Results from Executed Query

         - __Actors:__ User, System

         - __Preconditions:__ The user has successfully executed a query on the connected database.

         - __Postconditions:__ The user successfully views the results of the executed query in a readable and organized format.

         - Main Success Scenario:
            1. System retrieves results: The system retrieves the results of the executed query from the connected database.

            2. System displays results: The system displays the query results to the user in a readable and organized format.
            
            3. User views results: The user reviews the displayed results for analysis.
         
         - Extensions:
            - 1a. No results found: If the query returns no results, the system notifies the user that no data was found.

            - 1b. Result retrieval failure: If the system encounters an error while retrieving results, it displays an error message and suggests possible troubleshooting steps.
   
## Use Cases for the Query Builder Subsystem
### 1. Choose Database to Query
   1. Choose Database to Query
      - __Use Case Name:__ Choose Database to Query

      - __Actors:__ User, System

      - __Preconditions:__ The user is logged into the application and has connected databases.

      - __Postconditions:__ The user successfully selects a database to run their queries against.

      - Main Success Scenario:
         1. User views database list: The user navigates to the query builder section and views a list of connected databases.
         
         2. User selects a database: The user selects a database from the list.
         
         3. System confirms selection: The system confirms the selected database for the query session.
         
         4. User proceeds with query creation: The user begins creating a query against the selected database.
      
      - Extensions:
         - 2a. No databases connected: If no databases are connected, the system notifies the user and provides an option to connect a database.

### 2. Create a Query
   1. Create a Query Using Drag and Drop UI
      - __Use Case Name:__ Create a Query Using Drag and Drop UI

      - __Actors:__ User, System

      - __Preconditions:__ The user is logged into the application and has selected a database to query.

      - __Postconditions:__ The user successfully creates and runs a query using the drag and drop interface.

      - Main Success Scenario:
         1. User accesses drag and drop UI: The user navigates to the drag and drop query builder interface.
         
         2. User constructs query: The user drags and drops database elements (e.g., tables, columns) to construct a query.
         
         3. System visualizes query: The system visually represents the query structure as the user builds it.
         
         4. User modifies query: The user can modify the query by adjusting the elements within the drag and drop interface.
         
         5. User runs query: The user runs the constructed query.
         
         6. System executes query: The system executes the query against the selected database and displays the results.
      
      - Extensions:
         - 5a. Query error: If there is an error in the query, the system notifies the user.
   
   2. Create a Query Using a Form
      - __Use Case Name:__ Create a Query Using a Form

      - __Actors:__ User, System

      - __Preconditions:__ The user is logged into the application and has selected a database to query.

      - __Postconditions:__ The user successfully creates and runs a query using the form-based interface.

      - Main Success Scenario:
         1. User accesses form interface: The user navigates to the form-based query builder interface.

         2. User inputs query parameters: The user fills out the form with query parameters, selecting tables, columns, and conditions.
         
         3. System generates query: The system generates the query based on the input parameters.
         
         4. User submits form: The user submits the form to run the query.
         
         5. System executes query: The system executes the generated query against the selected database and displays the results.

      - Extensions:
         - 3a. Invalid input: If any input is invalid, the system notifies the user and prompts them to correct the input.
   
### 3. Toggle Between Views
   1. Toggle Between Views of the Query Building Process
      - __Use Case Name:__ Toggle Between Views of the Query Building Process

      - __Actors:__ User, System

      - __Preconditions:__ The user is logged into the application and is in the process of creating a query.

      - __Postconditions:__ The user successfully toggles between the drag and drop interface and the form interface without losing the query state.

      - Main Success Scenario:
         1. User initiates toggle: The user selects an option to switch between the drag and drop interface and the form interface.
         
         2. System maintains query state: The system maintains the current query state and converts it appropriately between the two interfaces.
         
         3. User continues query creation: The user continues building the query in the new interface.
         
         4. System notifies user: The system notifies the user of any changes or discrepancies that may arise from switching views.
      
      - Extensions:
         - 2a. Conversion error: If there is an error in converting the query state, the system notifies the user and provides options to resolve the discrepancies.

### 4. View Query Results Summary
   1. View Summary of Query Results
      - __Use Case Name:__ View Summary of Query Results

      - __Actors:__ User, System

      - __Preconditions:__ The user has successfully executed a query.

      - __Postconditions:__ The user views a summary of the query results, including key statistics and a preview of the result set.

      - Main Success Scenario:
         1. System displays summary: The system displays a summary of the query results, including key statistics such as row count.
         
         2. User views summary: The user reviews the summary to quickly understand the outcome of the query.
         
         3. System provides preview: The system provides a preview of the result set.
         
         4. User accesses detailed results: The user can access detailed results if needed for further analysis.
      
      - Extensions: 
         - 1a. No results found: If the query returns no results, the system notifies the user that no data was found.

### 5. Save Queries
   1. Save Queries
      - __Use Case Name:__ Save Queries

      - __Actors:__ User, System

      - __Preconditions:__ The user has created a query using either the drag and drop interface or the form interface.

      - __Postconditions:__ The user successfully saves the query for future use.

      - Main Success Scenario:
         1. User initiates save: The user selects an option to save the current query.
         
         2. User names query: The user provides a name and optional description for the query.
         
         3. System saves query: The system saves the query to the user's query library or saved queries list.
         
         4. System confirms save: The system confirms the successful save with a notification.
         
         5. User accesses saved queries: The user can access and manage saved queries from the query library or saved queries list.
      
      - Extensions:
         - 3a. Save failure: If the system encounters an error while saving the query, it notifies the user and provides options to retry or resolve the issue.

## Use Cases for the Reporting subsystem
### 1. Generate Reports
   1. Generate Reports of the Query Data
      - __Use Case Name:__ Generate Reports of the Query Data

      - __Actors:__ User, System

      - __Preconditions:__ The user has executed a query and has query results available.

      - __Postconditions:__ The user successfully generates a report based on the query data.

      - Main Success Scenario:
         1. User initiates report generation: The user selects an option to generate a report from the query results.
         
         2. System processes data: The system processes the query data.
         
         3. User selects report type: The user chooses the type of report to generate (graph or table).
         
         4. System generates report: The system generates the selected type of report.
         
         5. User views report: The user reviews the generated report.

      - Extensions:
         - 4a. Invalid data for report type: If the query data is not suitable for the selected report type, the system notifies the user and suggests alternatives.
   
   2. Generate Graph Reports
      - __Use Case Name:__ Generate Graph Reports

      - __Actors:__ User, System

      - __Preconditions:__ The user has executed a query and has query results available.

      - __Postconditions:__ The user successfully generates a graph report based on the query data.

      - Main Success Scenario:
         1. User selects graph report type: The user chooses to generate a graph report.
         
         2. User selects graph type: The user selects the type of graph (e.g., bar, line, pie).
         
         3. System generates graph: The system generates the graph based on the query data.
         
         4. User customizes graph: The user customizes graph settings and labels.
         
         5. System updates graph: The system updates the graph based on the user's customizations.
         
         6. User views graph report: The user reviews the generated graph report.

      - Extensions:
         - 3a. Invalid graph type selection: If the selected graph type is not compatible with the data, the system notifies the user and suggests alternatives.
   
   3. Generate Table Reports
      - __Use Case Name:__ Generate Table Reports

      - __Actors:__ User, System

      - __Preconditions:__ The user has executed a query and has query results available.

      - __Postconditions:__ The user successfully generates a table report based on the query data.

      - Main Success Scenario:
         1. User selects table report type: The user chooses to generate a table report.
         
         2. User selects columns and options: The user selects which columns to include and applies sorting or filtering options.
         
         3. System generates table: The system generates a table with the query data.
         
         4. User adjusts layout: The user adjusts the table layout and formatting.
         
         5. System updates table: The system updates the table based on the user's adjustments.
         
         6. User views table report: The user reviews the generated table report.
      
      - Extensions:
         - 2a. Invalid column selection: If the selected columns are not available, the system notifies the user and suggests alternatives.

### 2. Share Reports
   1. Share Exported Reports with Other Users.
      - __Use Case Name:__ Share Exported Reports with Other Users

      - __Actors:__ User, System, Recipient

      - __Preconditions:__ The user has generated a report.

      - __Postconditions:__ The report is successfully shared with selected recipients.

      - Main Success Scenario:
         1. User selects report to share: The user selects an exported report to share.
         
         2. User chooses recipients: The user selects individual users to share the report with.
         
         3. System sends report: The system sends the report to the selected recipients.
         
         4. Recipients receive report: The recipients receive a copy of the exported report.
         
         5. System notifies recipients: The system notifies the recipients that a report has been shared with them.
      
      - Extensions
         - 3a. Recipient email invalid: If a recipient's email is invalid, the system notifies the user and prompts for a valid email.

### 3. Export Reports
   1. Export Reports as PDF
      - __Use Case Name:__ Export Reports as PDF

      - __Actors:__ User, System

      - __Preconditions:__ The user has generated a report.

      - __Postconditions:__ The user successfully exports the report as a PDF.

      - Main Success Scenario:
         1. User selects PDF export: The user initiates export as a PDF.
         
         2. System generates PDF: The system generates a PDF file of the report.
         
         3. User downloads PDF: The user downloads or prints the PDF file.
      
      - Extensions:
         - 2a. PDF generation error: If an error occurs during PDF generation, the system notifies the user and provides options to retry or contact support.

   2. Export Reports as CSV
      - __Use Case Name:__ Export Reports as CSV

      - __Actors:__ User, System

      - __Preconditions:__ The user has generated a report.

      - __Postconditions:__ The user successfully exports the report as a CSV.

      - Main Success Scenario:
         1. User selects CSV export: The user initiates export as a CSV.
         
         2. System generates CSV: The system generates a CSV file of the report data.
         
         3. User downloads CSV: The user downloads the CSV file.

      - Extensions:
         - 2a. CSV generation error: If an error occurs during CSV generation, the system notifies the user and provides options to retry or contact support.

   3. Export Reports as Excel
      - __Use Case Name:__ Export Reports as Excel

      - __Actors:__ User, System

      - __Preconditions:__ The user has generated a report.

      - __Postconditions:__ The user successfully exports the report as an Excel file.

      - Main Success Scenario:
         1. User selects Excel export: The user initiates export as an Excel file.
         
         2. System generates Excel: The system generates an Excel file of the report data.
         
         3. User downloads Excel: The user downloads the Excel file.

      - Extensions:
         - 2a. Excel generation error: If an error occurs during Excel generation, the system notifies the user and provides options to retry or contact support.

## Use Cases for the Organisation subsystem
### 1. Create an Organisation
   1. Create an Organisation
      - __Use Case Name:__ Generate Reports of the Query Data

      - __Actors:__ User, System

      - __Preconditions:__ The user is logged into the system.

      - __Postconditions:__ The organisation is created, and the user is assigned as the organisation admin.

      - Main Success Scenario:
         1. User initiates organisation creation: The user selects the option to create an organisation.
         
         2. User enters organisation details: The user enters the organisation's details (e.g., name, address).
         
         3. System validates details: The system validates the entered details.
         
         4. System creates organisation: The system creates the organisation and assigns the user as the organisation admin.
         
         5. System confirms creation: The system sends a confirmation to the user about the successful creation of the organisation.
      
      - Extensions: 
         - 3a. Invalid details: If the entered details are invalid, the system notifies the user to correct the information.

### 2. Connect a Database to the Organisation
   1. Connect a Database to the Organisation
      - __Use Case Name:__ Connect a Database to the Organisation

      - __Actors:__ Organisation Admin, System

      - __Preconditions:__ The user is an organisation admin and is logged into the system.

      - __Postconditions:__ The database is connected to the organisation.

      - Main Success Scenario:
         1. Admin initiates database connection: The organisation admin selects the option to connect a database.
         
         2. Admin enters connection details: The admin enters the database connection details (e.g., type, host, port, username, password).
         
         3. System validates details: The system validates the entered connection details.
         
         4. System establishes connection: The system establishes the connection to the database.
         
         5. System confirms connection: The system sends a confirmation to the admin about the successful database connection.
      
      - Extensions:
         - 3a. Invalid connection details: If the connection details are invalid, the system notifies the admin to correct the information.

### 3. Add Other Users to the Organisation
   1. Invite Unregistered QBee Users
      - __Use Case Name:__ Invite Unregistered QBee Users

      - __Actors:__ Organisation Admin, System, Invited User

      - __Preconditions:__ The user is an organisation admin and is logged into the system.

      - __Postconditions:__ The unregistered user is invited to join the organisation.

      - Main Success Scenario:
         1. Admin initiates invitation: The organisation admin selects the option to invite users.
         
         2. Admin enters email addresses: The admin enters the email addresses of the unregistered users.
         
         3. System sends invitations: The system sends invitation emails to the unregistered users.
         
         4. Invited user registers: The unregistered users register for an account on QBee.
         
         5. Invited user joins organisation: Upon registration, the users join the organisation.

      - Extensions:
         - 3a. Invalid email addresses: If the entered email addresses are invalid, the system notifies the admin to correct the information.

   2. Invite Registered QBee Users
      - __Use Case Name:__ Invite Registered QBee Users

      - __Actors:__ Organisation Admin, System, Invited User

      - __Preconditions:__ The user is an organisation admin and is logged into the system.

      - __Postconditions:__ The registered user is invited to join the organisation.

      - Main Success Scenario:
         1. Admin initiates invitation: The organisation admin selects the option to invite users.
         
         2. Admin enters email addresses: The admin enters the email addresses of the registered users.
         
         3. System sends invitations: The system sends invitation emails to the registered users.
         
         4. Invited user accepts invitation: The registered users accept the invitation to join the organisation.
         
         5. System adds users to organisation: The system adds the users to the organisation upon acceptance.

      - Extensions:
         - 3a. Invalid email addresses: If the entered email addresses are invalid, the system notifies the admin to correct the information.
      
### 4. Manage User Roles
   1. IAssign Roles to Users
      - __Use Case Name:__ Assign Roles to Users

      - __Actors:__ Organisation Admin, System

      - __Preconditions:__ The user is an organisation admin and is logged into the system.

      - __Postconditions:__ Roles are assigned to users in the organisation.

      - Main Success Scenario:
         1. Admin views user list: The organisation admin views the list of users in the organisation.
         
         2. Admin assigns roles: The admin assigns predefined roles to each user.
         
         3. System updates roles: The system updates the users' roles.
         
         4. System notifies users: The system sends notifications to the users about their assigned roles.

      - Extensions:
         - 3a. Role assignment error: If there is an error in assigning roles, the system notifies the admin and suggests corrective actions.

   2. Manage Authorization and Access
      - __Use Case Name:__ Manage Authorization and Access

      - __Actors:__ Organisation Admin, System

      - __Preconditions:__ The user is an organisation admin and is logged into the system.

      - __Postconditions:__ The permissions and access levels for each role are managed.

      - Main Success Scenario:
         1. Admin accesses role management: The organisation admin accesses the role management interface.
         
         2. Admin modifies permissions: The admin defines or modifies permissions for each role.
         
         3. System enforces access control: The system enforces role-based access control based on the defined permissions.
         
         4. Users access features: Users access features and data as permitted by their roles.

      - Extensions:
         - 3a. Permission conflict: If there is a conflict in permissions, the system notifies the admin to resolve it.

   3. Define a New Role
      - __Use Case Name:__ Define a New Role

      - __Actors:__ Organisation Admin, System

      - __Preconditions:__ The user is an organisation admin and is logged into the system.

      - __Postconditions:__ A new role is defined and available for assignment.

      - Main Success Scenario:
         1. Admin accesses role management: The organisation admin accesses the role management interface.
         
         2. Admin creates new role: The admin creates a new role by specifying its name and permissions.
         
         3. System saves new role: The system saves the new role and makes it available for assignment.
         
         4. Admin assigns new role: The admin assigns the new role to users in the organisation.

      - Extensions:
         - 3a. Role creation error: If there is an error in creating the role, the system notifies the admin and suggests corrective actions.

### 5. Leave the Organisation
   1. Leave the Organisation
      - __Use Case Name:__ Leave the Organisation

      - __Actors:__ User, System

      - __Preconditions:__ The user is logged into the system and is a member of an organisation.

      - __Postconditions:__ The user is no longer associated with the organisation.

      - Main Success Scenario:
         1. User initiates leave process: The user selects the option to leave the organisation.
         
         2. System confirms decision: The system confirms the user's decision to leave.
         
         3. System removes user: The system removes the user from the organisation.
         
         4. System updates status: The system updates the user's status to reflect they are no longer part of the organisation.

      - Extensions:
         - 2a. Leave cancellation: If the user cancels the leave process, the system retains the user's membership in the organisation.

### 6. Remove Users from the Organisation
   1. Remove Users from the Organisation
      - __Use Case Name:__ Remove Users from the Organisation

      - __Actors:__ Organisation Admin, System

      - __Preconditions:__ The user is an organisation admin and is logged into the system.

      - __Postconditions:__ The selected users are removed from the organisation.

      - Main Success Scenario:
         1. Admin views user list: The organisation admin views the list of users in the organisation.
         
         2. Admin selects users to remove: The admin selects the users to remove from the organisation, excluding other admins.
         
         3. System removes users: The system removes the selected users from the organisation.
         
         4. System notifies removed users: The system sends notifications to the removed users about their removal.

      - Extensions:
         - 3a. Error in removal: If there is an error in removing users, the system notifies the admin and suggests corrective actions.

### 7. Access Organisation Saved Queries
   1. Access Organisation Saved Queries
      - __Use Case Name:__ Access Organisation Saved Queries

      - __Actors:__ User, System

      - __Preconditions:__ The user is a member of the organisation and is logged into the system.

      - __Postconditions:__ The user accesses and possibly runs or modifies saved queries.

      - Main Success Scenario:
         1. User views saved queries: The user views a list of saved queries within the organisation.
         
         2. User selects a query: The user selects a saved query from the list.
         
         3. System checks permissions: The system checks the user's permissions to ensure access.
         
         4. User runs or modifies query: The user runs or modifies the saved query based on their permissions.
         
         5. System executes query: The system executes the query and displays the results to the user.
      
      - Extensions:
         - 3a. Access denied: If the user does not have the necessary permissions, the system denies access and notifies the user.
      
### 8. Save Queries for the Organisation
   1. Save Queries for the Organisation
      - __Use Case Name:__ Save Queries for the Organisation

      - __Actors:__ User, System

      - __Preconditions:__ The user is a member of the organisation with the appropriate permissions and is logged into the system.

      - __Postconditions:__ The query is saved to the organisation's repository.

      - Main Success Scenario:
         1. User initiates save query: The user selects the option to save a query to the organisation's repository.
         
         2. User adds descriptions and tags: The user adds descriptions and tags to the query for easier retrieval.
         
         3. System validates query: The system validates the query and the user's permissions.
         
         4. System saves query: The system saves the query to the organisation's repository.
         
         5. System confirms save: The system confirms that the query has been saved and is accessible to other users based on their roles and permissions.

      - Extensions for;
         - 3a. Validation error: If the query or user permissions are invalid, the system notifies the user and suggests corrective actions.
               