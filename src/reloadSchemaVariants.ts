import { fetch, window } from 'coc.nvim';
import { print } from 'graphql';
import { ApolloConfigFormat } from './apollo';
import { SCHEMA_TAGS } from './operations.graphql';

export type GraphVariant = {
  name: string;
};

export const cachedVariants = {
  variants: Array<GraphVariant>(),
};

export async function reloadSchemaVariants(apolloConfig: ApolloConfigFormat): Promise<GraphVariant[]> {
  try {
    // Load schema variants & stats
    window.showMessage(`Variants Loading...`);
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
    window.showMessage('Variants Loaded!');
    const variants = (res as any).data.service.variants;
    cachedVariants.variants = variants;
    return variants;
  } catch (e) {
    window.showMessage(`${e}`);
    return [];
  }
}
