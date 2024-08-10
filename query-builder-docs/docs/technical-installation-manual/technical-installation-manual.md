---
sidebar_position: 1
---

# Cloning the system from Github

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
