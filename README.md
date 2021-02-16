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
3. Support loading schema from a remote endpoint, [example](https://www.apollographql.com/docs/devtools/apollo-config/#option-2-link-a-schema-from-a-remote-endpoint)

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
