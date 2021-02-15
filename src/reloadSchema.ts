import { fetch, window, workspace } from 'coc.nvim';
import fs from 'fs';
import {
  buildClientSchema,
  buildSchema,
  getIntrospectionQuery,
  GraphQLSchema,
  IntrospectionQuery,
  print,
  printSchema,
} from 'graphql';
import { ApolloConfigFormat } from './apollo';
import { ApolloGraphQLEndpoint } from './config';
import { SCHEMA_DOCUMENT } from './operations.graphql';

export const apolloClientSchema = `#graphql
"""
Direct the client to resolve this field locally, either from the cache or local resolvers.
"""
directive @client(
  """
  When true, the client will never use the cache for this value. See
  https://www.apollographql.com/docs/react/essentials/local-state/#forcing-resolvers-with-clientalways-true
  """
  always: Boolean
) on FIELD | FRAGMENT_DEFINITION | INLINE_FRAGMENT
"""
Export this locally resolved field as a variable to be used in the remainder of this query. See
https://www.apollographql.com/docs/react/essentials/local-state/#using-client-fields-as-variables
"""
directive @export(
  """
  The variable name to export this field as.
  """
  as: String!
) on FIELD
"""
Specify a custom store key for this result. See
https://www.apollographql.com/docs/react/advanced/caching/#the-connection-directive
"""
directive @connection(
  """
  Specify the store key.
  """
  key: String!
  """
  An array of query argument names to include in the generated custom store key.
  """
  filter: [String!]
) on FIELD
`;

export const cachedSchema: { source: string; schema: GraphQLSchema | null } = {
  source: '',
  schema: null,
};

export async function reloadSchemaFromEngine(apolloConfig: ApolloConfigFormat, variant: string) {
  const serviceConfig = apolloConfig.client.service;
  if (typeof serviceConfig === 'string') {
    // Handle format: schema@current
    const [serviceID] = serviceConfig.split('@');
    try {
      // Load schema Introspection, variants & stats
      window.showMessage(`Loading schema of: ${variant}...`);
      const { data, errors } = (await fetch(ApolloGraphQLEndpoint, {
        method: 'POST',
        headers: {
          'x-api-key': apolloConfig.engine?.apiKey,
        },
        data: {
          operationName: 'schemaDocument',
          query: print(SCHEMA_DOCUMENT),
          variables: { id: serviceID, tag: variant },
        },
      })) as any;

      if (!errors) {
        cachedSchema.source = data.service.schema.document + '\n' + apolloClientSchema;
        cachedSchema.schema = buildSchema(cachedSchema.source);

        // Write schema to file for language server
        fs.writeFileSync(`${workspace.root}/schema.graphql`, cachedSchema.source);
        window.showMessage(`Schema(${variant}) loaded: ${workspace.root}/schema.graphql`);
      }
    } catch (e) {
      console.error(e);
      window.showMessage(`Failed to load schema of variant: ${variant}`);
    }
  }
}

export async function reloadSchemaFromEndpoint(apolloConfig: ApolloConfigFormat) {
  const serviceConfig = apolloConfig.client.service;
  if (typeof serviceConfig !== 'string') {
    if (serviceConfig.kind === 'RemoteServiceConfig') {
      try {
        window.showMessage(`Loading schema from ${serviceConfig.url}`);
        const { data, errors } = (await fetch(serviceConfig.url, {
          method: 'POST',
          headers: serviceConfig.headers,
          data: {
            operationName: 'IntrospectionQuery',
            query: getIntrospectionQuery(),
          },
        })) as any;
        if (!errors) {
          console.error(data);
          cachedSchema.schema = buildClientSchema(data as IntrospectionQuery);
          cachedSchema.source = printSchema(cachedSchema.schema);

          // Write schema to file for language server
          fs.writeFileSync(`${workspace.root}/schema.graphql`, cachedSchema.source);
          window.showMessage(`Schema(${serviceConfig.url}) loaded: ${workspace.root}/schema.graphql`);
        }
      } catch (e) {
        console.error(e);
        window.showMessage(
          `Failed to load schema from ${serviceConfig.url}, please make sure the graphql service is running`
        );
      }
    }
  }
}
