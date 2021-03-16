import { fetch, window } from 'coc.nvim';
import { print } from 'graphql';
import { ApolloConfigFormat } from './apollo';
import { ApolloGraphQLEndpoint } from './config';
import { SCHEMA_TAGS } from './operations.graphql';
import { getServiceIDFromConfig } from './utils';

export type GraphVariant = {
  name: string;
};

export const cachedVariants = {
  variants: Array<GraphVariant>(),
};

export async function reloadSchemaVariants(apolloConfig: ApolloConfigFormat): Promise<GraphVariant[]> {
  if (typeof apolloConfig.client.service === 'string') {
    const serviceID = getServiceIDFromConfig(apolloConfig.client.service);
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
          variables: { id: serviceID },
        },
      })) as any;

      if (!errors) {
        const variants = data.service.variants;
        cachedVariants.variants = variants;
        window.showMessage('Variants Loaded!');
      } else {
        console.error(errors);
        window.showMessage(`${errors[0].message}`);
      }
      return cachedVariants.variants;
    } catch (e) {
      console.error(e);
      window.showMessage(
        `Failed to load schema variants, please make sure APOLLO_KEY is set and 'service' is configured property`
      );
      return [];
    }
  }
  return [];
}
