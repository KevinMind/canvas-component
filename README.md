# blog

## Todo

- [X] Setup monorepo
- [ ] add CI integration with vercel and basic package
- [ ] add component library package and website
- [ ] setup next.js and build step
- [ ] setup jest and storybook
- [ ] setup chromatic
- [ ] setup CMS
- [ ] setup backend API
- [ ] create blog layout and home page layout
- [ ] import components from previous project


## Adding a new package

We use plop to generate new packages. therea re 2 options

- name: the name for the package both in package.json and directory in packages/{{name}}
- tsconfigPreset: which tsconfig preset to use for the package. choose from one of the named files in packages/tsconfig/*

run `yarn generate:package` to initiate the CLI. with turborepo, the package should automatically be integrated into the various build/ci pipelines.

