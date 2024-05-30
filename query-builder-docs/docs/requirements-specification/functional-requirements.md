# Functional Requirements

## 1. User Management System

1. Provide a secure authentication process to users.
   1. Allow users to register on the application through the onboarding process of a one time pin.
   2. Allow users to log into the system with their credentials.
   3. Allow users to reset their password if forgotten.

2. Provide an interface to edit or change user's information
   1. Allow users to change their personal information (e.g. Name, surname, email, phone number, etc.).

3. Allow users to set personal preferences.

## 2. Database System Manager

1. Allow users to connect to external databases and store the database environment for interaction purposes.

2. Allow users to update the database connection details. (Various key updates or changes to the database connection details should be allowed).

3. Schema Management:
   1. Schema mapping: Map the database environment / schema to the intermediate language.
   2. Meta data extraction: Extract the meta data from the database schema.

4. Query Execution:
   1. Execute the query on the database. This requires an already translated query from the intermediate language to the database language.
   2. Fetch the results from the database. The results should be fetched and displayed to the user.

## 3. Query Builder

1. Allow users to choose a database to query.

2. Allow users to create a query.
   1. Allow users to use a drag and drop UI to create a query.
   2. Allow users to create a query via a form.

3. Allow users to toggle between views of the query building process.

4. Allow users to view a summary of the results of the query.

5. Allow users to save queries created.

## 4. Reporting System

1. Generate Reports: Allow users to generate reports of the query data.
   1. Graph Reports: Allow users to generate graph reports of the query data.
   2. Table Reports: Allow users to generate table reports of the query data.

2. Share Reports: Allow users to share the reports generated within the system.
   1. Allow users to share reports with other users.
   2. Allow users to share reports with other organisations.
   
3. Export Reports: Allow users to export the reports generated.
   1. Allow users to export the reports as a PDF.
   2. Allow users to export the reports as a CSV.
   3. Allow users to export the reports as an Excel file.

## 5. Organisation Management

1. Users must be able to create an organisation.
    1. A user creating a new organisation will be an admin.

2. Users that have an admin role for the organisation will be able to connect a database to the organisation.

3. Allow the organisation admin to add other users to the organisation
    1. Inviting an unregistered QBEE User.
    2. Existing users must be able to accept invites to an organisation.

4. Admin of the organisation will be able to manage user roles for the organisation
    1. Assign roles in the organisation to the users in the organisation
    2. Manage authorization and access of each role

5. Users must be able to leave the organisation

6. Admin must be able to remove users from the organisation but not other admins

7. Users in the organisation must be able to access organisation saved queries

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
   1. As a user, I want to change my personal information (e.g., name, surname, email, phone number), so that my account details are up-to-date.
      - Acceptance Criteria:
         - Users can access an "Edit Profile" section within the application.
         - Users can update fields such as name, surname, email, and phone number.
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
   1. As an organisation admin, I want to invite unregistered QBEE users to join the organisation, so that I can expand my team.
      - Acceptance Criteria:
         - Organisation admins can enter email addresses to send invitations.
         - The system sends an invitation email to the unregistered users.
         - Invited unregistered users can register for an account on QBEE
         - These new users can then join the organisation.

   2. As an organisation admin, I want to invite registered QBEE users to join the organisation, so that I can expand my team.
      - Acceptance Criteria:
         - Organisation admins can enter email addresses to send invitations.
         - The system sends an invitation email to the registered users.
         - Invited registered users can join the organisation.

   3. As an existing QBEE user, I want to accept invites to an organisation, so that I can join and contribute to the organisation.
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

