---
title: Components and Storybook
description: A guide on how to create components and stories as well as how to host Storybook locally for development
---

# Components and Storybook

## Preamble
Welcome to the guide on creating components and stories using Storybook!  
In this guide, we will explore the process of building reusable components and documenting them with stories. Additionally, we will learn how to host Storybook locally for efficient development and collaboration.

## Setup
To begin, ensure that all dependencies are installed.  
To do this, ensure that you are in the query-builder-app directory and run the following command:
```shell
# pnpm
pnpm install

# yarn
yarn install

# npm
npm install
```
You should now be ready to create components and use Storybook.

## Creating Components
To create a new component, navigate to the `./src/components` directory and create a folder for your component, and within that folder, create a new typescript file. Please ensure that the folder and file names are in `PascalCase` and that it ends with `.tsx`.
Example:
```shell
./src/components/MyComponent/MyComponent.tsx
```

After creating the component, go into the `./src/components/stories` directory and create a new typescript file with the name of your component followed by `.stories.tsx`.

> **Note:**
> There is an Example that has been included. It is called `Example` and can be found in the `./src/components` directory.

## Running Storybook Locally
To run Storybook locally, ensure that you are in the query-builder-app directory and run the following command:
```shell
# pnpm
pnpm run storybook

# yarn
yarn storybook

# npm
npm run storybook
```
