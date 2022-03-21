# blog

## Todo

- [X] Setup monorepo
- [X] add CI integration with vercel and basic package
- [X] add component library package and website
- [X] setup next.js and build step
- [X] setup jest and storybook
- [X] setup chromatic
- [ ] setup CMS
- [ ] setup backend API
- [ ] create blog layout and home page layout
- [ ] import components from previous project

## Repo package structure

### Adding a new package

We use plop to generate new packages. therea re 2 options

- name: the name for the package both in package.json and directory in packages/{{name}}
- tsconfigPreset: which tsconfig preset to use for the package. choose from one of the named files in packages/tsconfig/*

run `yarn generate:package` to initiate the CLI. with turborepo, the package should automatically be integrated into the various build/ci pipelines.

### Adding a new app

We use plop to generate new apps. there is one option

- name: the name for the package both in package.json and directory in packages/{{name}}

run `yarn generate:app` to initiate the CLI. with turborepo, the package should automatically be integrated into the various build/ci pipelines.

## Testing

### Global tests

- [ ] Test that packages/apps are valid

- no dupliate package/app names
- no package/app with root name

- all apps have
-- jest.config.js
-- tsconfig.json
-- .eslintrc.js
-- package.json scripts

- all packages have:
-- tsconfig.json
-- .eslintrc.js
-- package.json scripts
-- package.json jest preset

## Packages

### UI

https://623670d49b1e54004a0be84c-tsfuqaennc.chromatic.com/

## Chromatic

- chromatic allows only one project per repository so we have to either, use 1 storybook for all stories, or trigger chromatic manually
- we can use turbo repo to trigger manually
- we can use environment variables to set branch and appId
- there is an issue with playwrite and stale node_modules so I've disabled the npm cache until it is fixed

links:

- permalinks: https://www.chromatic.com/docs/permalinks
- playwrite bug: https://github.com/microsoft/playwright/issues/4033
- npm cache github actions: https://github.community/t/how-to-clear-cache-in-github-actions/129038/5
- storybook test-runner: https://github.com/storybookjs/test-runner/blob/main/README.md#storiesjson-mode

Solution:

- split test and storybook-test to allow normal jest runs to happen in the CI job.
- storybook-test is a separate command that can be run manually for local testing.
- the storybook interaction tets are run automatically during chromatic builds
- we can trigger multiple chromatic builds with a single job using turbo repo and project specific environment variables



