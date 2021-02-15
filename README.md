# coc-apollo-graphql (WIP)

coc.nvim extension for Apollo GraphQL. Still work in progress, feedbacks and PRs are welcome.

## Install

`:CocInstall coc-apollo-graphql`

## Features
### Client Project
1. [GraphQL Language Server](https://github.com/graphql/graphiql/blob/main/packages/graphql-language-service-server/README.md): autocomplete, diagnostics...
2. Apollo GraphQL integration
    - Graph variants switching
    - Performance stats (require `virtual text`)

### Service project
TODO...

## Setup
1. Add `APOLLO_KEY` to `.env`
2. Add `apollo.config.json` or `apollo.config.js`
2. Add [graphql-config](https://github.com/kamilkisiela/graphql-config) for graphql language server
3. (Optional) Use [vim-graphql](https://github.com/jparise/vim-graphql) for syntax highlighting

The plugin will download schema from Apollo Schema Registry, it generates `schema.graphql` file. So you have to specify `"schema": "schema.graphql"` in the config.

Example `graphql.config.json`
```json
{
  "schema": "schema.graphql",
  "documents": "src/**/*.{ts}"
}
```

## Lists

Show variant list: 
```
:CocList variants
```

## Commands
Reload Apollo graphql schema variant list
```
:CocCommand apollo.reload.variants
```

Reload Apollo field stats
```
:CocCommand apollo.reload.stats
```
## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
