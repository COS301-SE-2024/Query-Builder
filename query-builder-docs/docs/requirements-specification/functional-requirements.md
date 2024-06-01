---
title: Functional Requirements
description: The functional requirements of the QBee Query Builder system
sidebar_position: 3
---

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
    1. Inviting an unregistered QBee User.
    2. Existing users must be able to accept invites to an organisation.

4. Admin of the organisation will be able to manage user roles for the organisation
    1. Assign roles in the organisation to the users in the organisation
    2. Manage authorization and access of each role

5. Users must be able to leave the organisation

6. Admin must be able to remove users from the organisation but not other admins

7. Users in the organisation must be able to access organisation saved queries