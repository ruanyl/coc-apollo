import {
  GraphQLSchema,
  IntrospectionQuery,
  buildClientSchema,
  buildSchema,
  getIntrospectionQuery,
  print,
  printSchema,
} from 'graphql';
import { fetch, window, workspace } from 'coc.nvim';

import { ApolloConfigFormat } from './apollo';
import { ApolloGraphQLEndpoint } from './config';
import { CocApolloGraphqlExtensionError } from './errors';
import { SCHEMA_DOCUMENT } from './operations.graphql';
import { extname } from 'path';
import fs from 'fs';
import { getServiceIDFromConfig } from './utils';

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
    const serviceID = getServiceIDFromConfig(serviceConfig);
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
        if (data.service.schema) {
          cachedSchema.source = data.service.schema.document + '\n' + apolloClientSchema;
          cachedSchema.schema = buildSchema(cachedSchema.source);

          // Write schema to file for language server
          fs.writeFileSync(`${workspace.root}/schema.graphql`, cachedSchema.source);
          window.showMessage(`Schema(${variant}) loaded: ${workspace.root}/schema.graphql`);
          workspace.nvim.setVar('coc_apollo_current_variant', `${variant}`, true);
        } else {
          window.showMessage(`Schema(${variant}) not found`);
        }
      } else {
        console.error(errors);
        window.showMessage(`${errors[0].message}`);
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
          // Build schema from introspection
          let schema = buildClientSchema(data as IntrospectionQuery);

          // Combine schema with Apollo client schema
          cachedSchema.source = printSchema(schema) + '\n' + apolloClientSchema;
          schema = buildSchema(cachedSchema.source);

          cachedSchema.schema = schema;

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

export function reloadSchemaFromLocal(apolloConfig: ApolloConfigFormat) {
  const serviceConfig = apolloConfig.client.service;
  if (typeof serviceConfig !== 'string') {
    if (serviceConfig.kind === 'LocalServiceConfig') {
      const localSchemaFile = Array<string>().concat(serviceConfig.localSchemaFile);
      if (localSchemaFile.length > 0) {
        window.showMessage(`Loading schema from: ${localSchemaFile.join(', ')}...`);
        const schemaDefs = localSchemaFile.map((path) => {
          let content = '';
          try {
            content = fs.readFileSync(path).toString();
          } catch (e) {
            console.error(`Unable to read file ${path}. ${e}`);
          }

          const ext = extname(path);

          if (ext === '.json') {
            const json = JSON.parse(content);
            const __schema = json.data ? json.data.__schema : json.__schema ? json.__schema : json;
            const schema = buildClientSchema({ __schema });
            return printSchema(schema);
          } else if (['.graphql', '.graphqls', '.gql'].includes(ext)) {
            return content;
          }
          throw new CocApolloGraphqlExtensionError(
            'Unsupported file type in `localSchemaFile`. Must be a .json, .graphql, .gql, or .graphqls file'
          );
        });
        if (schemaDefs) {
          cachedSchema.source = [...schemaDefs, apolloClientSchema].join('\n');
          cachedSchema.schema = buildSchema(cachedSchema.source);

          // Write schema to file for language server
          fs.writeFileSync(`${workspace.root}/schema.graphql`, cachedSchema.source);
          window.showMessage(`Schema loaded:  ${workspace.root}/schema.graphql`);
        }
      }
    }
  }
}
