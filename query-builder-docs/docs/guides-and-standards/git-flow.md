---
title: Git flow
description: A guide on how to use git flow in the context of the Query Builder application
---

# Git Flow

## Preamble

We have decided to use git flow in order to simplify, automate and standardize our usage of git, allowing us to focus on our implementation while keeping our version controlling to a high standard.

## Setup
To get started, go to the main directory and type:
```shell
git flow init
```

You will then be guided through the process:
```shell
Which branch should be used for bringing forth production releases?
   - main
Branch name for production releases: [main] 
```
Press enter to continue to the development branch:

```shell
Branch name for "next release" development: [develop]
```
At this stage, you need to add `dev`:
```shell
Branch name for "next release" development: [develop] dev
```

For the following, just leave all the defaults by hitting enter:
```shell
Feature branches? [feature/] 
Bugfix branches? [bugfix/] 
Release branches? [release/] 
Hotfix branches? [hotfix/] 
Support branches? [support/] 
Version tag prefix? [] 
```

At this stage, your path will be displayed and you are all set!

## Usage

You can now create your branch:
```shell
git flow feature start <feature branch name>
git flow feature publish <feature branch name>

#Example
git flow feature start hello-world # will create feature/hello-world
git flow feature publish hello-world # will publish feature/hello-world to the online repository
```
You can now code and commit on your branch as usual:
```shell
git add .
git commit -m "feat: this is a commit message"
```
> **Note:** This can also be done through the VSCode Extension.

The process when pushing the feature up to the GitHub Repository:
```shell
# checkout the dev branch
git checkout dev

# pull any changes from the online repo
git pull

# checkout the feature branch
git checkout feature/hello-world

# rebase the feature branch on the dev branch
git rebase dev
```
> **Note:** This allows for the resolution of merge conflicts locally.

Once this process has been completed, the online repository can be updated with the local changes:

```shell
git push -f
```