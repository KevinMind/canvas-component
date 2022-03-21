# Blog

## Setting up GraphQL

Tried using webpack plugins and graphql-codegen. Ended up using graphql-let as it supports transpilation and compilation with a pretty simple config.

- https://graphcms.com/blog/working-with-graphql-code-generator-and-graphcms
- https://www.apollographql.com/docs/react/get-started
- https://github.com/piglovesyou/graphql-let
- https://www.chromatic.com/docs/monorepos

GraphCMS endpoint: https://api-eu-central-1.graphcms.com/v2/ckjo70qrrqzg901xybnzecdvn/master

Error with graphql 16 and graphql-codegen https://github.com/croutonn/graphql-codegen-plugin-typescript-swr/issues/179

graphql-let does not currently recompile graphql typings files when .graphql file is changed. would be nice to integrate with next to support this. Look here https://github.com/bring-shrubbery/next-graphql-let-plugin



