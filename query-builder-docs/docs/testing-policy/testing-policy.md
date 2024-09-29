---
sidebar_position: 7
title: Testing Policy
description: Testing Policy for QBee
---

# Testing Policy

## Overview
- Vitest is used to test the frontend
- Jest is used to test the backend
- Cypress is used for integration testing
- CodeCov is used to monitor code coverage

>**Note:** *Vitest* was chosen for the frontend as it extends *Jest* by providing interfaces that can more easily be used to test the frontend.  
*Cypress* was chosen for integration testing as it is widely used, had good documentation and is easy to set up.  
*CodeCov* was used as, initially alternatives were tried but multiple issues were encountered, whereas CodeCov was easy to set up and use and provided good GitHub integrations.

## Aims
The main aim of testing is to ensure that the application is working as expected. This includes:
- Ensuring that the frontend is working as expected
- Ensuring that the backend is working as expected
- Ensuring that the frontend and backend communicate as expected (integration)
- Ensuring that when something does go wrong, the application can recover gracefully (fail safely)

## Implementation
To achieve the aims set out above, the team adheres to the following:
- As a feature is developed, tests are written to ensure that the feature works as expected. This prevents the need for the developer to return later and write tests for the feature.
- The group aims to have 75% coverage or greater, as reported by CodeCov.
- CI/CD automation is achieved using Github Actions, which run on all pull requests. These actions check that all tests pass and that the coverage is above a threshold. If any actions fail, the developer who opened the pull request is expected to fix the issues.
- To keep the team accountable and to enforce the previous point, a team member is assigned as a reviewer to each pull request. The reviewer has to approve the pull request before it can be merged (in the case of the main branch, two or more reviewers are required). This ensures that the code is of a high quality and that the tests are written correctly.

>**Note:** Within the frontend and backend tests, mocking is used to ensure that the tests are isolated and that they do not rely on external services, eliminating the possibility of incorrect input - isolating the case and allowing for a more accurate test.