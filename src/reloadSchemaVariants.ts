import { fetch, window } from 'coc.nvim';
import { print } from 'graphql';
import { ApolloConfigFormat } from './apollo';
import { ApolloGraphQLEndpoint } from './config';
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
    const { data, errors } = (await fetch(ApolloGraphQLEndpoint, {
      method: 'POST',
      headers: {
        'x-api-key': apolloConfig?.engine?.apiKey,
      },
      data: {
        operationName: 'SchemaTags',
        query: print(SCHEMA_TAGS),
        variables: { id: apolloConfig?.client.service },
      },
    })) as any;

    if (!errors) {
      const variants = data.service.variants;
      cachedVariants.variants = variants;
      window.showMessage('Variants Loaded!');
      return variants;
    }
    return [];
  } catch (e) {
    window.showMessage(
      `Failed to load schema variants, please make sure APOLLO_KEY is set and 'service' is configured property`
    );
    return [];
  }
}
