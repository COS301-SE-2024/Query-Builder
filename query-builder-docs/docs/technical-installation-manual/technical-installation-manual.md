---
sidebar_position: 4
---

# Technical Installation Manual

To run the QBee system yourself, you will need to firstly clone the system's source code from our Github repository. Then the system can be run inside Docker, and you can setup your own Supabase instance to act as your system's datastore.

## Cloning the system from Github

To clone the system from Github, you will need to have Git installed on your machine. If you do not have Git installed, you can download it from the [Git website](https://git-scm.com/downloads).

To clone the system from Github, follow these steps:

1. Open your terminal.
2. Navigate to the directory where you would like to clone the system.
3. Run the following command:

```bash
git clone https://github.com/COS301-SE-2024/Query-Builder.git
```

4. Once the system has been cloned, navigate to the `Query-Builder` directory.
5. To install the necessary dependencies, run the following command:
6. We use pnpm as our package manager. If you do not have pnpm installed, you can install it by running the following command:

```bash
npm install -g pnpm
```

7. Once pnpm is installed, run the following command to install the necessary dependencies in each of the system's directories:

```bash
cd query-builder-app && pnpm install
cd ../
cd query-builder-docs && pnpm install
cd ../
cd query-builder-backend && pnpm install
```

8. Once the dependencies have been installed, you can start the system by running the following command:

```bash
cd query-builder-app && pnpm start
```

9. The frontend should now be running and you can access it by navigating to `http://localhost:3000` in your web browser.

10. To start the backend, run the following command:

```bash
cd ../
cd query-builder-backend && pnpm start
```

11. The backend should now be running and you can access it on `http://localhost:55555`.

12. To start the documentation, run the following command:

```bash
cd ../
cd query-builder-docs && pnpm start
```

13. The documentation should now be running and you can access it on `http://localhost:3001`.

You have now successfully cloned the system from Github and started the frontend, backend, and documentation. You can now start using the system.

## Running the system using Docker

To run the system using Docker, you will need to have Docker installed on your machine. If you do not have Docker installed, you can download it from the [Docker website](https://www.docker.com/products/docker-desktop).

To run the system using Docker, follow these steps:

1. Open your terminal.
2. Navigate to the directory where you have cloned the system.
3. Run the following command to build the Docker images:

```bash
docker-compose up
```

4. Once the Docker images have been built, you can access the the different parts of the system as follows:
    - The frontend can be accessed on `http://localhost:3000`.
    - The backend can be accessed on `http://localhost:55555`.
    - The documentation can be accessed on `http://localhost:3001`.

## Setting up Supabase with the system

To set up Supabase with the system, follow these steps:

1. Create a Supabase account by visiting the [Supabase website](https://supabase.io/).

2. Once you have created an account, create a new project and database.

3. Once your project and database have been created, you will have to find the necessary environment variables to connect the system to your Supabase project.

4. Open the `query-builder-backend` directory in your terminal.

5. Create a new `.env` file in the `query-builder-backend` directory.

6. Add the following environment variables to the `.env` file:

```bash
SUPABASE_URL=<YOUR_SUPABASE_URL>
SUPABASE_KEY=<YOUR_SUPABASE_ANON_KEY>
SUPABASE_JWT_SECRET=<YOUR_SUPABASE_JWT_SECRET>
UNI_KEY=<YOUR_UNI_KEY (you will have to generate this to use for the security encryption)>
SESSION_SECRET=<YOUR_SESSION_SECRET (you will have to generate this for use of sessions)>
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
```

7. Save the `.env` file.

8. Open the `query-builder-app` directory in your terminal.

9. Create a new `.env.local` file in the `query-builder-app` directory.

10. Add the following environment variables to the `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
NEXT_PUBLIC_SUPABASE_PROJECT_ID=<YOUR_SUPABASE_PROJECT_ID>
```
11. Save the `.env.local` file.

12. You will need to setup the database schema in Supabase. To do this, you can run the code in the schema.sql file in the root of the query-builder-backend directory.

13. You have now successfully set up Supabase with the system. You can now start using the system with Supabase as the database.
