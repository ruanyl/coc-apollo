# coc-apollo (WIP)

coc.nvim extension for Apollo GraphQL. Still work in progress, feedbacks and PRs are welcome.

## Install

`:CocInstall coc-apollo`

## Features
### Client Project
1. [GraphQL Language Server](https://github.com/graphql/graphiql/blob/main/packages/graphql-language-service-server/README.md): autocomplete, diagnostics...
2. Apollo GraphQL integration (Use the Apollo schema registry)
    - Graph variants switching
    - Performance stats (require `virtual text`)
3. Support loading schema from a remote endpoint, [example config](https://www.apollographql.com/docs/devtools/apollo-config/#option-2-link-a-schema-from-a-remote-endpoint)
4. Support loading schema from local: [example config](https://www.apollographql.com/docs/devtools/apollo-config/#option-3-link-a-schema-from-a-local-file)

### Service project
TODO...

## Setup
1. Add `APOLLO_KEY` to `.env`
2. Add [graphql-config](https://github.com/kamilkisiela/graphql-config) for graphql language server
3. (Optional) Add `apollo.config.json` or `apollo.config.js`, [config details](https://www.apollographql.com/docs/devtools/apollo-config/)
4. (Optional) Use [vim-graphql](https://github.com/jparise/vim-graphql) for syntax highlighting

## Configure graphql.config.json
The plugin will download schema from Apollo Schema Registry/local schema/remote schema, it generates `schema.graphql` file by default. So you have to specify `"schema": "schema.graphql"` in the config in order for language server to read.

Example `graphql.config.json`
```json
{
  "schema": "schema.graphql"
}
```

You can also customize the exported schema filename and type with `:CocConfig`
```
{
  "apollo.schema.filename": "schema.json"
}
```
This will output the file in json format by converting the schema to schema introspection

## Configurations

`apollo.defaultVariant` the default apollo graph variant to download when the plugin been initially loaded, default: current

## Setup status line
![statusline](https://user-images.githubusercontent.com/486382/108122730-69b42980-70ad-11eb-9c70-b99e216d2373.png)
```vimscript
function! LightlineCocApolloStatus() abort
  let status = get(g:, 'coc_apollo_current_variant', '')
  if empty(status)
    return ''
  endif
  return '🚀 ' . status
endfunction

let g:lightline = {
  \ 'active': {
  \   'left': [
  \     [ 'mode', 'paste' ],
  \     [ 'readonly', 'filename' ]
  \   ],
  \   'right':[
  \     [ 'filetype', 'lineinfo', 'percent', 'cocstatus' ],
  \     [ 'cocapollo' ]
  \   ],
  \ },
  \ 'component_function': {
  \   'cocapollo': 'LightlineCocApolloStatus'
  \ }
\ }

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
