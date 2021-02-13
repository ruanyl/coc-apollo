import { BasicList, fetch, ListAction, ListContext, ListItem, Neovim, window } from 'coc.nvim';
import { print } from 'graphql';
import { ApolloConfigFormat } from './apollo';
import { reloadSchema } from './reloadSchema';
import { SCHEMA_TAGS } from './schemaTags';

type GraphVariant = {
  name: string;
};

export async function loadSchemaVariants(apolloConfig: ApolloConfigFormat): Promise<GraphVariant[]> {
  try {
    // Load schema variants & stats
    window.showMessage(`Loading...`);
    const res = await fetch('https://graphql.api.apollographql.com/api/graphql', {
      method: 'POST',
      headers: {
        'x-api-key': apolloConfig?.engine?.apiKey,
      },
      data: {
        operationName: 'SchemaTags',
        query: print(SCHEMA_TAGS),
        variables: { id: apolloConfig?.client.service },
      },
    });
    window.showMessage('');
    return (res as any).data.service.variants;
  } catch (e) {
    window.showMessage(`${e}`);
    return [];
  }
}

export default class ApolloVariantList extends BasicList {
  public readonly name = 'apollo_schema_variants';
  public readonly description = 'CocList for Apollo schema variants';
  public readonly defaultAction = 'open';
  public actions: ListAction[] = [];
  public apolloConfig: ApolloConfigFormat;

  constructor(nvim: Neovim, apolloConfig: ApolloConfigFormat) {
    super(nvim);
    this.apolloConfig = apolloConfig;

    this.addAction('open', (item: ListItem) => {
      reloadSchema(this.apolloConfig, item.data.name);
    });
  }

  public async loadItems(context: ListContext): Promise<ListItem[]> {
    const variants = await loadSchemaVariants(this.apolloConfig);

    return variants.map((variant) => ({
      label: variant.name,
      data: variant,
    }));
  }
}
