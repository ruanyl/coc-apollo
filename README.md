# coc-apollo-graphql (WIP)

coc.nvim extension for Apollo GraphQL

## Install

`:CocInstall coc-apollo-graphql`

## Features
### Client Project
1. [GraphQL Language Server](https://github.com/graphql/graphiql/blob/main/packages/graphql-language-service-server/README.md): autocomplete, diagnostics...
2. Apollo GraphQL integration
    - Graph variants switching
    - Performance stats

### Service project
TODO...

## Setup
1. Use [vim-graphql](https://github.com/jparise/vim-graphql) for syntax highlighting
2. Add `APOLLO_KEY` to `.env`
3. Add [graphql-config](https://github.com/kamilkisiela/graphql-config) for graphql language server

The plugin will download schema from remote and and generate `schema.graphql` file

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
